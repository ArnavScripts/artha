import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.21.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!geminiKey || !supabaseUrl || !supabaseKey) {
            throw new Error("Missing Environment Variables");
        }

        const { scenarioId, interventionId, userId } = await req.json();

        if (!scenarioId || !interventionId || !userId) {
            throw new Error("Missing required parameters");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // DIAGNOSTIC: Check if table exists
        const { error: tableCheckError } = await supabase.from('scenarios').select('id').limit(1);
        if (tableCheckError) {
            console.error("Table check failed:", tableCheckError);
            throw new Error("Database table 'scenarios' is missing or inaccessible: " + tableCheckError.message);
        }

        // 1. Fetch Context
        const { data: scenario } = await supabase
            .from('scenarios')
            .select('*')
            .eq('id', scenarioId)
            .single();

        const { data: intervention } = await supabase
            .from('interventions')
            .select('*')
            .eq('id', interventionId)
            .single();

        if (!scenario || !intervention) {
            throw new Error("Scenario or Intervention not found");
        }

        // 2. AI Simulation Prompt
        const prompt = `
        You are a Financial Simulation Engine.
        
        CONTEXT:
        - Baseline Annual Carbon Cost: ₹${scenario.baseline_cost}
        - Proposed Intervention: "${intervention.title}"
        - Expected Impact: ${intervention.impact_description}
        - Reduction Target: ${intervention.reduction_percentage}%

        TASK:
        Generate a 12-month projection of costs comparing "Business As Usual" (BAU) vs "Optimized" (after intervention).
        - BAU should show slight inflation (2-5% annual).
        - Optimized should reflect the reduction percentage starting from Month 1, potentially with a ramp-up period.
        - Return ONLY a JSON array.

        OUTPUT FORMAT:
        [
            { "month": "2024-01-01", "bau_value": 50000, "optimized_value": 45000 },
            ...
        ]
        `;

        // 3. Generate
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const projections = JSON.parse(responseText);

        // 4. Save to DB (Replace existing projections for this scenario/intervention combo if we were tracking per-intervention, but for now we update the main scenario projections)
        // Note: In a real app, we might merge multiple interventions. Here we simulate the *cumulative* effect or just this one.
        // Let's assume we overwrite the scenario's projections for this demo.

        // Clear old projections
        await supabase.from('projections').delete().eq('scenario_id', scenarioId);

        // Insert new projections
        const dbProjections = projections.map((p: any) => ({
            scenario_id: scenarioId,
            month: p.month,
            bau_value: p.bau_value,
            optimized_value: p.optimized_value
        }));

        const { error: insertError } = await supabase
            .from('projections')
            .insert(dbProjections);

        if (insertError) throw insertError;

        // Update Intervention Status
        await supabase
            .from('interventions')
            .update({ is_applied: true })
            .eq('id', interventionId);

        return new Response(JSON.stringify({ success: true, projections: dbProjections }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Simulation Error:", error);
        return new Response(JSON.stringify({
            error: error.message,
            message: error.message
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
