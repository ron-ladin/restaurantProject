import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  ILLMProvider,
  NegotiationRequest,
  NegotiationResult,
} from "../../../core/interfaces/ILLMProvider.js";

export class GeminiProvider implements ILLMProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
  }

  async negotiate(request: NegotiationRequest): Promise<NegotiationResult> {
    const prompt = this.buildPrompt(request);

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      return JSON.parse(responseText) as NegotiationResult;
    } catch (error) {
      console.error("[GeminiProvider] Error during negotiation:", error);
      throw new Error("Failed to reach consensus through AI.");
    }
  }

  private buildPrompt(request: NegotiationRequest): string {
    return `
      You are a specialized Multi-Agent Negotiation Moderator. 
      Your goal is to simulate a 3-round negotiation dialogue between the following users to choose ONE restaurant.

      USERS PROFILES:
      ${JSON.stringify(request.users, null, 2)}

      CANDIDATE RESTAURANTS:
      ${JSON.stringify(request.candidates, null, 2)}

      RULES:
      1. Each agent has "Hard Constraints" (e.g., Kosher, Vegan) which are NON-NEGOTIABLE.
      2. Preferences (Price, Cuisine) are negotiable but agents will fight for them based on their importance.
      3. Agents must express their internal "thought" (Chain of Thought) before speaking.
      4. The negotiation must last exactly 3 rounds of dialogue.
      5. At the end, you must reach a consensus on ONE restaurant ID from the provided list.

      RETURN FORMAT (Strict JSON):
      {
        "finalRestaurantId": "string",
        "consensusReached": boolean,
        "satisfactionScores": { "agentId": number (1-10) },
        "transcript": [
          { "agentName": "string", "thought": "internal reasoning", "speech": "what they say" }
        ],
        "summary": "brief explanation of why this restaurant was chosen"
      }
    `;
  }
}
