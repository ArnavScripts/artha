import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.13.0";
import { z } from "npm:zod";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Zod Schema for strict validation
const BillDataSchema = z.object({
    consumption: z.number().positive(),
    unit: z.string(),
    cost: z.number().optional(),
    date: z.string(),
    type: z.enum(['electricity', 'diesel', 'natural_gas', 'coal', 'logistics']).nullable(),
});

// Emission Factors (Grid India & Standard)
const EMISSION_FACTORS: Record<string, number> = {
    electricity: 0.82, // kgCO2e/kWh
    diesel: 2.68,      // kgCO2e/L
    natural_gas: 1.90, // kgCO2e/kg
    coal: 2.42,        // kgCO2e/kg
    logistics: 0.10    // kgCO2e/tonne-km (approx road freight)
};

const ANOMALY_THRESHOLDS: Record<string, number> = {
    electricity: 5000, // kWh
    diesel: 500,       // L
    natural_gas: 1000, // kg
    coal: 1000,        // kg
    logistics: 10000   // tonne-km
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 0. Environment Check
        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!geminiKey || !supabaseUrl || !supabaseKey) {
            throw new Error("Missing Environment Variables: GEMINI_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY");
        }

        const { fileUrl, userId } = await req.json();

        if (!fileUrl || !userId) {
            throw new Error("Missing fileUrl or userId");
        }

        // 1. Initialize Gemini
        const genAI = new GoogleGenerativeAI(geminiKey);

        // Robust Model Selection with Fallback
        let model;
        // Using models confirmed by diagnostic endpoint
        const primaryModelName = "gemini-flash-latest";
        const fallbackModelName = "gemini-pro-latest";

        try {
            // We don't actually "fetch" the model here, but we set it up.
            // The error usually happens at generateContent.
            // However, we can try to be explicit about what we are using.
            model = genAI.getGenerativeModel({ model: primaryModelName });
        } catch (e) {
            console.warn(`Failed to initialize ${primaryModelName}, falling back to ${fallbackModelName}`);
            model = genAI.getGenerativeModel({ model: fallbackModelName });
        }

        // 2. Fetch the image
        const imageResp = await fetch(fileUrl);
        if (!imageResp.ok) {
            throw new Error(`Failed to fetch image: ${imageResp.statusText}`);
        }
        const imageBlob = await imageResp.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const base64Image = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        // 3. Gemini Vision Extraction
        const prompt = `Extract data from this utility bill. Return a JSON object with a "items" array. Each item should have: { "consumption": number, "unit": string, "cost": number, "date": string (YYYY-MM-DD), "type": string }. 
        
        Rules:
        1. Normalize "type" to: "electricity", "diesel", "natural_gas", "coal", or "logistics".
        2. For logistics/freight, calculate "consumption" as Weight (tonnes) * Distance (km) and set unit to "tonne-km".
        3. If unit is "gallons", keep it as "gallons_us" (we will convert it).
        4. If unclear, use "other". 
        5. If the bill contains multiple line items, list them as separate items.`;

        let result;
        try {
            result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: imageBlob.type,
                    },
                },
            ]);
        } catch (error: any) {
            console.error(`Error with model ${primaryModelName}:`, error);
            console.log(`Attempting fallback to ${fallbackModelName}...`);
            const fallbackModel = genAI.getGenerativeModel({ model: fallbackModelName });
            result = await fallbackModel.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: imageBlob.type,
                    },
                },
            ]);
        }

        const responseText = result.response.text();

        // Clean JSON
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        let rawData;

        try {
            rawData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", responseText);
            throw new Error(`AI returned invalid JSON: ${responseText.substring(0, 100)}...`);
        }

        // Normalize to array
        const items = Array.isArray(rawData.items) ? rawData.items : (Array.isArray(rawData) ? rawData : [rawData]);

        const supabase = createClient(supabaseUrl, supabaseKey);
        let totalCarbonEmission = 0;
        let processedCount = 0;
        let insertedRecords = [];

        // 6. Loop and Write
        for (const item of items) {
            // Validation
            const validation = BillDataSchema.safeParse(item);
            let processedData = {
                consumption: 0,
                unit: 'unknown',
                cost: 0,
                date: new Date().toISOString().split('T')[0],
                type: null as string | null,
                status: 'needs_review',
                confidence: 0.5
            };

            if (validation.success) {
                processedData = {
                    ...validation.data,
                    status: 'verified',
                    confidence: 0.95
                };
            } else {
                processedData = { ...processedData, ...item, status: 'needs_review', confidence: 0.4 };
            }

            // Unit Conversion
            if (processedData.unit && processedData.unit.toLowerCase().includes('gallon')) {
                processedData.consumption = processedData.consumption * 3.785; // Convert Gallons to Liters
                processedData.unit = 'L';
            }

            // Calculation
            let carbonEmission = 0;
            if (processedData.type && EMISSION_FACTORS[processedData.type] && processedData.consumption) {
                carbonEmission = (processedData.consumption * EMISSION_FACTORS[processedData.type]) / 1000;
            }
            totalCarbonEmission += carbonEmission;

            // Database Write
            const { data, error } = await supabase
                .from('emissions_log')
                .insert({
                    user_id: userId,
                    bill_url: fileUrl,
                    source_type: processedData.type,
                    unit_type: processedData.unit,
                    consumption: processedData.consumption,
                    total_cost: processedData.cost,
                    bill_date: processedData.date,
                    carbon_emission: carbonEmission,
                    ai_confidence: processedData.confidence,
                    status: processedData.status,
                    raw_ai_response: item
                })
                .select()
                .single();

            if (error) {
                console.error("DB Insert Error:", error);
                continue; // Skip failed inserts but try others
            }
            insertedRecords.push(data);
            processedCount++;

            // Anomaly Detection (Per Item)
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', userId)
                    .single();

                if (profile?.organization_id && processedData.type && ANOMALY_THRESHOLDS[processedData.type]) {
                    if (processedData.consumption > ANOMALY_THRESHOLDS[processedData.type]) {
                        await supabase.from('anomaly_logs').insert({
                            organization_id: profile.organization_id,
                            source: processedData.type,
                            anomaly: `High consumption detected: ${processedData.consumption} ${processedData.unit} (Threshold: ${ANOMALY_THRESHOLDS[processedData.type]})`,
                            status: 'unresolved'
                        });
                        await supabase.from('live_feed').insert({
                            organization_id: profile.organization_id,
                            message: `Anomaly detected in ${processedData.type}: High consumption`,
                            type: 'warning'
                        });
                    }
                }
            } catch (e) {
                console.error("Anomaly check failed", e);
            }
        }

        // 7. Live Feed Summary
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', userId)
                .single();

            if (profile?.organization_id && processedCount > 0) {
                await supabase.from('live_feed').insert({
                    organization_id: profile.organization_id,
                    message: `Processed bill with ${processedCount} items. Total: ${totalCarbonEmission.toFixed(2)} tCO2e`,
                    type: 'success'
                });
            }
        } catch (feedError) {
            console.error("Failed to update live feed:", feedError);
        }

        return new Response(JSON.stringify({ success: true, records: insertedRecords }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Edge Function Error:", error);
        return new Response(JSON.stringify({ error: error.message, details: error.stack }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
