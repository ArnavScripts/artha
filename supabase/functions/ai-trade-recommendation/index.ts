import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.21.0";
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
        // 1. Initialize Clients
        const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 2. Fetch LIVE Market Context
        // Get latest price
        const { data: ticker } = await supabase
            .from('market_ticker')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

        // Get Order Book Snapshot (Top 5 Bids/Asks)
        const { data: orderBook, error: obError } = await supabase
            .from('order_book')
            .select('*')
            .eq('status', 'open');

        if (obError) {
            console.error("Database Error (OrderBook):", obError);
            // Fail gracefully if DB missing
        }

        const currentPrice = ticker?.price || 580;
        const volume24h = ticker?.volume || 0;

        // Simple aggregate of order book for the prompt
        const bids = orderBook?.filter(o => o.type === 'buy') || [];
        const asks = orderBook?.filter(o => o.type === 'sell') || [];
        const buyPressure = bids.reduce((acc, b) => acc + b.quantity, 0);
        const sellPressure = asks.reduce((acc, a) => acc + a.quantity, 0);

        const marketContext = {
            symbol: "CCTS",
            current_price: currentPrice,
            market_sentiment: buyPressure > sellPressure ? "bullish" : "bearish",
            order_book_imbalance: buyPressure / (sellPressure || 1), // >1 means more buyers
            volume_24h: volume24h
        };

        // 3. User Portfolio (Sanitized for Privacy/Legal compliance - DPDP Act)
        // CRITICAL: innovative abstraction layer to prevent leaking raw financials to LLM
        // Ideally derived from real DB user data, here mocked safely.

        // We do NOT send "1,500,000" cash. We send "SOLVENCY_STATUS".
        const portfolio = {
            liquidity_status: "HIGH_LIQUIDITY_TIER_1", // > 10L
            inventory_status: "HOLDING_ADEQUATE", // > 1000 credits
            compliance_deadline: "Q4_FY26",
            liability_gap: "MODERATE"
        };

        // 4. Prompt Engineering (Refined for CFO/Risk Persona)
        const prompt = `
      Act as the Chief Sustainability Risk Officer (CSRO) for an Indian Enterprise.
      
      MARKET CONTEXT (LIVE):
      ${JSON.stringify(marketContext, null, 2)}
      
      INTERNAL STATUS (SANITIZED):
      ${JSON.stringify(portfolio, null, 2)}
      
      GOAL:
      Analyze market conditions to optimize Carbon Liability Management under CCTS trading norms.
      Do NOT behave like a day trader. Focus on regulatory compliance cost and long-term risk.
      
      TASK:
      Recommend a strategic action:
      - ACCUMULATE: If prices are favorable and we have a liability gap.
      - DEFER: If market is overheated and we have time.
      - HEDGE: If volatility is high.
      
      OUTPUT JSON:
      {
        "action": "ACCUMULATE|DEFER|HEDGE",
        "recommended_volume_tier": "Low|Medium|High",
        "limit_price_suggestion": number,
        "confidence": number (0-100),
        "strategic_rationale": "Brief executive summary for the CFO. Focus on risk/reward."
      }
    `;

        // 5. Generate Insight
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
