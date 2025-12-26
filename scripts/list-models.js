import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// import { GoogleGenerativeAI } from "@google/generative-ai"; // Not needed for REST call

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

async function listModels() {
    const key = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY; // Try both
    if (!key) {
        console.error("GEMINI_API_KEY not found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);
    // There isn't a direct listModels method in the SDK usually, 
    // but we can try to use the model to generate content and see if it works,
    // or use the REST API directly if SDK doesn't support listing.
    // Wait, the error message said "Call ListModels to see the list".
    // The SDK might not expose it directly in the main class.
    // Let's try a simple fetch to the API endpoint.

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (e) {
        console.error("Failed to list models:", e);
    }
}

listModels();
