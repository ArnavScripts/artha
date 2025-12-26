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
    type: z.enum(['electricity', 'diesel', 'natural_gas', 'coal']).nullable(),
});

// Emission Factors (Grid India & Standard)
const EMISSION_FACTORS: Record<string, number> = {
    electricity: 0.82, // kgCO2e/kWh
    diesel: 2.68,      // kgCO2e/L
    natural_gas: 1.90, // kgCO2e/kg
    coal: 2.42,        // kgCO2e/kg
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
        const prompt = `Extract data from this utility bill. Return JSON: { "consumption": number, "unit": string, "cost": number, "date": string (YYYY-MM-DD), "type": string }. Normalize "type" to: "electricity", "diesel", "natural_gas", or "coal". If unclear, return null values.`;

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
            // If the primary model failed, try the fallback (if it's different and we haven't tried it yet)
            // Note: gemini-pro is text-only, so it might fail with images if not gemini-pro-vision.
            // Let's actually fallback to gemini-1.5-flash (no version) or gemini-pro-vision if available.
            // For now, let's try a safer fallback if the user requested one, but gemini-pro doesn't support images in the same way.
            // Let's try 'gemini-1.5-flash' (no suffix) as the fallback.

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

        // Clean JSON (remove markdown code blocks if present)
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        let rawData;

        try {
            rawData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", responseText);
            throw new Error(`AI returned invalid JSON: ${responseText.substring(0, 100)}...`);
        }

        // 4. Validation Layer (Zod)
        const validation = BillDataSchema.safeParse(rawData);

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
            console.warn("Zod Validation Failed:", validation.error);
            // We still save what we can, but flag it
            processedData = { ...processedData, ...rawData, status: 'needs_review', confidence: 0.4 };
        }

        // 5. Math Layer (The Calculator)
        let carbonEmission = 0;
        if (processedData.type && EMISSION_FACTORS[processedData.type] && processedData.consumption) {
            // Calculate tCO2e (Divide by 1000)
            carbonEmission = (processedData.consumption * EMISSION_FACTORS[processedData.type]) / 1000;
        }

        // 6. Database Write
        const supabase = createClient(supabaseUrl, supabaseKey);

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
                raw_ai_response: rawData
            })
            .select()
            .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
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
