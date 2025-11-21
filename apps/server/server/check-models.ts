// apps/server/check-models.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function main() {
  console.log("🔍 Checking available Gemini models for your API Key...");
  try {
    // There isn't a direct 'listModels' in the simplified Node SDK, 
    // so we test the most common ones to see which connects.
    
    const candidates = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-001",
      "gemini-1.5-pro",
      "gemini-1.5-pro-001",
      "gemini-pro",
      "gemini-1.0-pro"
    ];

    for (const modelName of candidates) {
      process.stdout.write(`Testing ${modelName}... `);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log("✅ AVAILABLE");
      } catch (e: any) {
        if (e.message.includes("404") || e.message.includes("not found")) {
          console.log("❌ NOT FOUND");
        } else {
          console.log(`⚠️ Error: ${e.message.split('\n')[0]}`);
        }
      }
    }
  } catch (error) {
    console.error("Fatal Error:", error);
  }
}

main();