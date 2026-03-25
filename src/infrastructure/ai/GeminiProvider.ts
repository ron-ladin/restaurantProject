// src/infrastructure/ai/GeminiProvider.ts
import { GoogleGenAI } from "@google/genai";
import {
  ILLMProvider,
  NegotiationRequest,
  NegotiationResult,
} from "../../core/interfaces/ILLMProvider.js";

export class GeminiProvider implements ILLMProvider {
  private ai: any;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async negotiate(request: NegotiationRequest): Promise<NegotiationResult> {
    const prompt = this.buildPrompt(request);

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.8, // העלינו מעט כדי שיהיה דיון מעניין
        },
      });

      // לוג חשוב לדיבאג - כאן תראה מה ה-AI באמת שלח
      console.log("[GeminiProvider] Raw Response:", response.text);

      const data = JSON.parse(response.text);

      // הגנה: אם ה-AI שכח את ה-transcript, ניצור מערך ריק כדי שלא יקרוס
      return {
        finalRestaurantId: data.finalRestaurantId || "",
        consensusReached: !!data.consensusReached,
        satisfactionScores: data.satisfactionScores || {},
        transcript: data.transcript || [], // מוודא שזה תמיד מערך
        summary: data.summary || "No summary provided.",
      };
    } catch (error) {
      console.error("[GeminiProvider] Parse Error:", error);
      throw new Error("AI returned invalid JSON structure.");
    }
  }

  private buildPrompt(request: NegotiationRequest): string {
    // הוספתי דגש קריטי על השמות של השדות
    return `
      Return ONLY a JSON object with these EXACT keys: 
      "finalRestaurantId", "consensusReached", "satisfactionScores", "transcript", "summary".
      
      "transcript" MUST be an array of objects: {"agentName": "string", "thought": "string", "speech": "string"}.

      Data to process:
      Users: ${JSON.stringify(request.users)}
      Restaurants: ${JSON.stringify(request.candidates)}
    `;
  }
}
