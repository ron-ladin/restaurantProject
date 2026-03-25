// src/index.ts
import dotenv from "dotenv";
import { MockRestaurantRepository } from "./infrastructure/database/MockRestaurantRepository.js";
import { RestaurantFilterService } from "./core/services/RestaurantFilterService.js";
import { NegotiationService } from "./core/services/NegotiationService.js";
import { GeminiProvider } from "./infrastructure/ai/GeminiProvider.js";
import { UserPreference } from "./core/domain/types.js";

// טעינת משתני סביבה מה-.env
dotenv.config();

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY in .env file.");
    process.exit(1);
  }

  // 1. Setup Infrastructure
  const repository = new MockRestaurantRepository();
  const filterService = new RestaurantFilterService(repository);

  // 2. Setup AI Layer
  const geminiProvider = new GeminiProvider(apiKey);
  const negotiationService = new NegotiationService(geminiProvider);

  // 3. Define the Agents (Users)
  const mockUsers: UserPreference[] = [
    {
      agentId: "u1",
      name: "Dana",
      hardConstraint: "Kosher",
      constraintImportance: 5,
      preferredPriceTier: 3,
      priceImportance: 2,
      preferredCuisine: "Jewish",
      cuisineImportance: 4,
      stubbornnessLevel: 8,
    },
    {
      agentId: "u2",
      name: "Mia",
      hardConstraint: "Vegan",
      constraintImportance: 5,
      preferredPriceTier: 1, // מחפשת זול מאוד
      priceImportance: 5,
      preferredCuisine: "Healthy",
      cuisineImportance: 3,
      stubbornnessLevel: 6,
    },
    {
      agentId: "u3",
      name: "Leo",
      hardConstraint: "None",
      constraintImportance: 1,
      preferredPriceTier: 4,
      priceImportance: 3,
      preferredCuisine: "American BBQ",
      cuisineImportance: 5,
      stubbornnessLevel: 4,
    },
  ];

  console.log("--- Starting Multi-Agent Session ---\n");

  // שלב א': סינון מתמטי
  console.log("[Step 1] Filtering restaurants based on math...");
  const topCandidates = await filterService.getTopCandidates(mockUsers, 5);

  console.log(`Found ${topCandidates.length} potential candidates.\n`);

  // שלב ב': משא ומתן מבוסס AI
  console.log("[Step 2] Handing over to AI Agents for negotiation...");
  try {
    const result = await negotiationService.runNegotiation(
      mockUsers,
      topCandidates,
    );

    console.log("\n--- The Negotiation Transcript ---");
    console.log("----------------------------------");

    result.transcript.forEach((msg, index) => {
      console.log(
        `Round ${Math.floor(index / mockUsers.length) + 1} | ${msg.agentName}:`,
      );
      console.log(`  > Thought: ${msg.thought}`);
      console.log(`  > Says: "${msg.speech}"\n`);
    });

    console.log("----------------------------------");
    console.log("--- FINAL VERDICT ---");
    console.log(
      `Status: ${result.consensusReached ? "Consensus Reached! ✅" : "No Consensus ❌"}`,
    );

    if (result.finalRestaurantId) {
      const chosen = topCandidates.find(
        (c) => c.id === result.finalRestaurantId,
      );
      console.log(
        `Selected Restaurant: ${chosen?.name} (ID: ${result.finalRestaurantId})`,
      );
    }

    console.log(`Summary: ${result.summary}`);
    console.log("Satisfaction Scores:", result.satisfactionScores);
  } catch (error) {
    console.error("Fatal error during negotiation:", error);
  }
}

main().catch(console.error);
