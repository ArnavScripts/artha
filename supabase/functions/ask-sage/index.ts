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
        // 0. Environment Check
        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!geminiKey || !supabaseUrl || !supabaseKey) {
            throw new Error("Missing Environment Variables");
        }

        const { userId, message, sessionId: clientSessionId } = await req.json();

        if (!userId || !message) {
            throw new Error("Missing userId or message");
        }

        // 1. Initialize Clients
        const supabase = createClient(supabaseUrl, supabaseKey);
        const genAI = new GoogleGenerativeAI(geminiKey);

        // DIAGNOSTIC: Check if table exists
        const { error: tableCheckError } = await supabase.from('chat_sessions').select('id').limit(1);
        if (tableCheckError) {
            console.error("Table check failed:", tableCheckError);
            throw new Error("Database table 'chat_sessions' is missing or inaccessible: " + tableCheckError.message);
        }

        // 1.5 Session Management
        let sessionId = clientSessionId;
        if (!sessionId) {
            // Create new session
            const { data: session, error: sessionError } = await supabase
                .from('chat_sessions')
                .insert({
                    user_id: userId,
                    title: message.substring(0, 30) + "...", // Simple title for now
                    is_active: true
                })
                .select()
                .single();

            if (sessionError) throw new Error("Failed to create session: " + sessionError.message);
            sessionId = session.id;
        }

        // 1.6 Store User Message
        const { error: msgError } = await supabase
            .from('chat_messages')
            .insert({
                session_id: sessionId,
                role: 'user',
                content: message
            });

        if (msgError) throw new Error("Failed to save user message: " + msgError.message);

        // Model Selection (Sage needs reasoning, so Pro is preferred)
        let model;
        const primaryModelName = "gemini-1.5-flash"; // Using Flash for speed/stability as per previous fixes
        const fallbackModelName = "gemini-1.5-pro";

        try {
            model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
        } catch (e) {
            model = genAI.getGenerativeModel({ model: fallbackModelName, generationConfig: { responseMimeType: "application/json" } });
        }

        // 2. Context Aggregation (Parallel Fetching)
        // We need: Profile -> OrgId -> Org Data + Transactions + Emissions

        // A. Get Org ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', userId)
            .single();

        if (!profile?.organization_id) {
            throw new Error("User has no organization linked");
        }

        const orgId = profile.organization_id;

        // B. Parallel Fetch
        const [orgResult, txResult, emissionsResult, historyResult, scenarioResult] = await Promise.all([
            supabase.from('organizations').select('*').eq('id', orgId).single(),
            supabase.from('transactions').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(5),
            supabase.from('emissions_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
            supabase.from('chat_messages').select('role, content').eq('session_id', sessionId).order('created_at', { ascending: true }).limit(10), // Context window
            supabase.from('scenarios').select('*, interventions(*)').eq('user_id', userId).eq('status', 'active').order('created_at', { ascending: false }).limit(1).single()
        ]);

        const orgData = orgResult.data;
        const transactions = txResult.data || [];
        const emissions = emissionsResult.data || [];
        const history = historyResult.data || [];
        const activeScenario = scenarioResult.data;
        const existingInterventions = activeScenario?.interventions || [];

        // 1. DEFINITIONS (The AI's Knowledge Base)
        const ARTHA_SITE_MAP = {
            dashboard: { path: "/dashboard", desc: "Main overview, KPIs, and alerts." },
            wallet: { path: "/dashboard/wallet", desc: "Treasury, balance, deposits, and withdrawals." },
            emissions: { path: "/dashboard/emissions", desc: "Live carbon emission tracking and IoT feeds." },
            market: { path: "/dashboard/market", desc: "Carbon credit trading, buying/selling credits." },
            regulatory: { path: "/dashboard/regulatory", desc: "Compliance reports and government mandates." },
            intelligence: { path: "/dashboard/intelligence", desc: "AI War Room, predictive modeling, and simulations." }
        };

        // 3. Construct System Prompt (Agentic Persona)
        const systemPrompt = `
You are Artha Sage, the Operating System Intelligence for this platform.
Your goal is to assist the user by Analyzing Data, Navigating the UI, and Executing Tasks.

### YOUR CAPABILITIES (THE "HANDS"):
You can control the user's interface. You do this by returning specific "Action Codes".
1. **NAVIGATE:** Move the user to a specific dashboard screen.
2. **REQUEST_ACCESS:** Ask for permission to read sensitive data (e.g., "Full Transaction History").
3. **EXECUTE_FUNC:** Trigger specific client-side functions (e.g., "Run Simulation").

### THE APP STRUCTURE (THE "MAP"):
${JSON.stringify(ARTHA_SITE_MAP, null, 2)}

### RESPONSE FORMAT (STRICT JSON):
You must ALWAYS return a JSON object. Do not return plain text.
Structure:
{
  "message": "Your markdown response here (keep it executive and concise).",
  "action": {
    "type": "NAVIGATE" | "REQUEST_ACCESS" | "EXECUTE_FUNC" | "NONE",
    "payload": "..."
  },
  "data": { // OPTIONAL: Only if generating a new roadmap/scenario
    "type": "roadmap",
    "title": "Scenario Title",
    "interventions": [
      { "title": "...", "impact_description": "...", "capex_cost": 0, "npv_value": 0, "reduction_percentage": 0 }
    ]
  }
}

### CRITICAL INSTRUCTIONS:
1. **NO STALLING:** Do NOT return messages like "Analyzing...", "Processing...", or "One moment".
2. **IMMEDIATE RESULTS:** If you have the data (which is provided in the CONTEXT below), perform the analysis IMMEDIATELY and return the result in the \`message\` field.
3. **SIMULATIONS:** If the user asks for a plan or simulation, and you have the data:
   - **CHECK EXISTING ROADMAP:** Review the "Existing Roadmap" in the CONTEXT. Do NOT generate interventions that are already listed or semantically identical.
   - **NO DUPLICATES:** If the user asks for more strategies but you cannot find any *new* viable options based on the data, explicitly state: "I cannot identify any further viable decarbonization strategies with the current data." and do NOT return a \`data\` field.
   - **GENERATE NEW:** Only if you find *new* strategies, generate the textual plan in the \`message\` field and the structured roadmap in the \`data\` field.
   - Set the \`action\` to \`EXECUTE_FUNC: refresh_simulation\`.

### EXAMPLE ROADMAP RESPONSE:
{
  "message": "I've generated a strategic plan focusing on immediate energy efficiency...",
  "action": { "type": "EXECUTE_FUNC", "payload": "refresh_simulation" },
  "data": {
    "type": "roadmap",
    "title": "Q4 Decarbonization Strategy",
    "interventions": [
      { "title": "LED Retrofit", "impact_description": "Replace warehouse lighting", "capex_cost": 50000, "npv_value": 120000, "reduction_percentage": 15 },
      { "title": "Solar PPA", "impact_description": "On-site solar installation", "capex_cost": 0, "npv_value": 500000, "reduction_percentage": 40 }
    ]
  }
}

### INTERACTION SCENARIOS:
1. **User:** "Take me to the trading screen."
   **You:** { "message": "Navigating to Carbon Markets.", "action": { "type": "NAVIGATE", "payload": "/dashboard/market" } }

2. **User:** "Analyze my spending patterns."
   **You:** (If you don't have transaction data yet)
   { "message": "To analyze spending, I need access to your detailed transaction ledger. Shall I proceed?", "action": { "type": "REQUEST_ACCESS", "payload": "TRANSACTIONS_READ" } }

3. **User:** (After granting access) "Yes."
   **You:** (Now you have the data)
   { "message": "**Analysis Complete:**\n- Total Spend: ₹50L\n- Highest Category: Procurement.", "action": { "type": "NONE" } }

CONTEXT:
CURRENT STATE:
- Organization Balance: ${orgData?.credits_purchased || 0} Carbon Credits
- Recent Transactions: ${JSON.stringify(transactions.map(t => ({ type: t.type, amount: t.amount, date: t.created_at })))}
- Recent Emissions: ${JSON.stringify(emissions.map(e => ({ type: e.source_type, amount: e.carbon_emission, date: e.bill_date })))}
- Existing Roadmap: ${JSON.stringify(existingInterventions.map((i: any) => ({ title: i.title, impact: i.impact_description })))}

CHAT HISTORY:
${history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n')}

USER QUERY: "${message}"

REMINDER: You MUST return valid JSON. If generating a plan, include the "data" field with type "roadmap".
`;

        // 4. Generate Response
        let text = "";
        try {
            const result = await model.generateContent(systemPrompt);
            text = result.response.text();
        } catch (genError: any) {
            console.error("Primary model failed, trying fallback:", genError);
            // Fallback to stable model
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
            const result = await fallbackModel.generateContent(systemPrompt);
            text = result.response.text();
        }
        // 5. Store AI Response
        let parsedResponse;
        try {
            // Clean the response if it contains markdown code blocks
            const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
            parsedResponse = JSON.parse(cleanText);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            console.log("Raw Text:", text);
            // Fallback if AI returns raw text despite instructions
            // DEBUG: Append error to message so we can see it in UI
            parsedResponse = {
                message: text + "\n\n---\n**DEBUG: JSON Parse Failed**\nRaw output was not valid JSON. Action not triggered.",
                action: { type: "NONE" }
            };
        }

        // 6. Handle Roadmap Generation (DB Insert)
        if (parsedResponse.data && parsedResponse.data.type === 'roadmap') {
            try {
                let scenarioId;

                if (activeScenario) {
                    // Append to existing
                    scenarioId = activeScenario.id;
                    console.log("Appending to existing scenario:", scenarioId);
                } else {
                    // Create new scenario if none exists
                    const { data: newScenario, error: scenarioError } = await supabase
                        .from('scenarios')
                        .insert({
                            user_id: userId,
                            name: parsedResponse.data.title || 'AI Generated Plan',
                            status: 'active',
                            baseline_cost: 5000000 // Default baseline
                        })
                        .select()
                        .single();

                    if (scenarioError) throw scenarioError;
                    scenarioId = newScenario.id;
                }

                // Create interventions
                if (parsedResponse.data.interventions && parsedResponse.data.interventions.length > 0) {
                    const interventions = parsedResponse.data.interventions.map((i: any) => ({
                        scenario_id: scenarioId,
                        title: i.title,
                        impact_description: i.impact_description,
                        capex_cost: i.capex_cost || 0,
                        npv_value: i.npv_value || 0,
                        reduction_percentage: i.reduction_percentage || 0
                    }));
                    await supabase.from('interventions').insert(interventions);
                }

                // Ensure action is set to refresh
                parsedResponse.action = { type: 'EXECUTE_FUNC', payload: 'refresh_simulation' };

            } catch (dbError) {
                console.error("Failed to update roadmap:", dbError);
                parsedResponse.message += "\n\n(Note: Failed to save roadmap to database.)";
            }
        }

        await supabase
            .from('chat_messages')
            .insert({
                session_id: sessionId,
                role: 'assistant',
                content: parsedResponse.message,
                metadata: parsedResponse.action ? { action: parsedResponse.action } : {}
            });

        return new Response(JSON.stringify({ response: text, sessionId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Ask-Sage Error:", error);
        return new Response(JSON.stringify({
            error: error.message,
            message: error.message // Include 'message' for supabase-js compatibility
        }), {
            status: 200, // Return 200 to ensure client receives the error body
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
