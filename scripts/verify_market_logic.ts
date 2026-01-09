
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars. Make sure .env is present.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runVerification() {
    console.log("🔍 Starting Market Engine Verification...");

    // 1. Simulate Market Ticker Bot Logic (since we can't wait for cron)
    console.log("\n--- 1. Testing Market Ticker Insertion ---");

    const { data: lastTicker } = await supabase
        .from('market_ticker')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

    const currentPrice = lastTicker?.price || 580;
    console.log(`Current Price: ₹${currentPrice}`);

    const newPrice = Number((currentPrice + (Math.random() - 0.5) * 5).toFixed(2));
    console.log(`Simulating New Tick: ₹${newPrice}`);

    const { error: insertError } = await supabase.from('market_ticker').insert({
        symbol: 'CCTS',
        price: newPrice,
        volume: Math.floor(Math.random() * 5000) + 1000
    });

    if (insertError) {
        console.error("❌ Ticker Insert Failed:", insertError.message);
    } else {
        console.log("✅ Ticker Inserted Successfully");
    }

    // 2. Verify Data Persistence
    console.log("\n--- 2. Verifying Persistence ---");
    const { data: latest } = await supabase
        .from('market_ticker')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

    if (latest?.price === newPrice) {
        console.log("✅ Data Verified in DB: ", latest);
    } else {
        console.error("❌ Data Verification Failed. Expected", newPrice, "Got", latest?.price);
    }

    // 3. Test Order Book Connectivity
    console.log("\n--- 3. Testing Order Book ---");
    const { data: orders, error: orderError } = await supabase
        .from('order_book')
        .select('*')
        .limit(5);

    if (orderError) {
        console.error("❌ Order Book Read Failed:", orderError.message);
    } else {
        console.log(`✅ Order Book Accessible. Found ${orders.length} orders.`);
    }

    console.log("\n🏁 Verification Complete.");
}

runVerification();
