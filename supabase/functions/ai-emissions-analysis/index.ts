import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { query, date_range } = await req.json();

        // 1. Initialize Clients
        const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Using Pro for deeper analysis

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 2. Fetch Data
        const { data: emissions } = await supabase
            .from('emissions_records')
            .select('*')
            .limit(50); // Fetch recent records

        const { data: anomalies } = await supabase
            .from('anomaly_logs')
            .select('*')
            .limit(10);

        // 3. Prompt Engineering
        const prompt = `
      Act as an environmental engineer and data scientist. Analyze the user's query and the provided data.
      
      User Query: "${query || "Analyze my recent emissions for anomalies"}"
      
      Data Context:
      Emissions: ${JSON.stringify(emissions?.slice(0, 10), null, 2)}
      Anomalies: ${JSON.stringify(anomalies, null, 2)}
      
      Task:
      Provide a concise analysis.
      Identify specific insights or patterns.
      Recommend corrective actions.
      
      Output Format (JSON only):
      {
        "response": "Brief summary string",
        "insights": [
          {
            "type": "anomaly|trend|success",
            "source": "string",
            "recommendation": "string"
          }
        ]
      }
    `;

        // 4. Generate Insight
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonStr);

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
