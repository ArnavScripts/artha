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
        const { portfolio_id, market_context } = await req.json();

        // 1. Initialize Clients
        const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 2. Fetch Data (RAG - Retrieval Augmented Generation)
        // In a real app, we would fetch the actual portfolio and market prices here.
        // For this demo, we'll simulate the data context.
        const contextData = {
            portfolio: {
                cash_balance: 1500000,
                holdings: [
                    { symbol: "CCTS", quantity: 5000, avg_price: 450 }
                ]
            },
            market: {
                current_price: 580,
                trend: market_context || "rising",
                volatility: "medium"
            }
        };

        // 3. Prompt Engineering
        const prompt = `
      Act as a senior carbon market trader. Analyze the following context and recommend a trade action.
      
      Context:
      ${JSON.stringify(contextData, null, 2)}
      
      Task:
      Recommend an action (BUY, SELL, or HOLD).
      Calculate the quantity and price.
      Provide a brief rationale (max 2 sentences).
      
      Output Format (JSON only):
      {
        "action": "BUY|SELL|HOLD",
        "quantity": number,
        "price_per_unit": number,
        "confidence": number (0-100),
        "rationale": "string"
      }
    `;

        // 4. Generate Insight
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
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
