import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});
process.env = { ...process.env, ...env };

async function testFunction(name, payload) {
    const url = `${process.env.VITE_SUPABASE_URL}/functions/v1/${name}`;
    const key = process.env.VITE_SUPABASE_ANON_KEY;

    console.log(`Testing ${name}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const text = await response.text();

        console.log(`Status: ${status}`);
        console.log(`Response: ${text}`);

        try {
            const json = JSON.parse(text);
            if (json.error) {
                console.error(`ERROR: ${json.error}`);
            }
        } catch (e) {
            // Ignore JSON parse error
        }
        console.log('---');
    } catch (error) {
        console.error(`Failed to fetch ${name}:`, error);
    }
}

async function main() {
    // Test ask-sage
    await testFunction('ask-sage', {
        userId: '00000000-0000-0000-0000-000000000000', // Dummy ID
        message: 'Test'
    });

    // Test run-simulation
    await testFunction('run-simulation', {
        userId: '00000000-0000-0000-0000-000000000000',
        scenarioId: '00000000-0000-0000-0000-000000000000',
        interventionId: '00000000-0000-0000-0000-000000000000'
    });
}

main();
