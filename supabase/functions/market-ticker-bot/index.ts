
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // COMPLIANCE OVERRIDE: P0-CYCLE-1
    // This service has been deprecated by the Product Council (Legal).
    // Reason: "Unregistered Investment Advice" risk under SEBI/CCTS norms.
    // See: product_council_transcript.md

    return new Response(JSON.stringify({
        error: "Service Deprecated: Real-time simulation disabled for Regulatory Compliance.",
        compliance_ref: "SEBI-IA-REG-VIOLATION-PREVENTION",
        status: "halted"
    }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 410, // Gone
    });
});

