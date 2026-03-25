// src/index.ts
import { MockRestaurantRepository } from "./infrastructure/database/MockRestaurantRepository.js";
import { RestaurantFilterService } from "./core/services/RestaurantFilterService.js";
import { UserPreference } from "./core/domain/types.js";

async function main(): Promise<void> {
  const repository = new MockRestaurantRepository();
  const filterService = new RestaurantFilterService(repository);

  // Defining a diverse group with conflicting needs
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
      stubbornnessLevel: 8, // High stubbornness
    },
    {
      agentId: "u2",
      name: "Mia",
      hardConstraint: "Vegan",
      constraintImportance: 4,
      preferredPriceTier: 2,
      priceImportance: 5, // Very price-sensitive
      preferredCuisine: "Mediterranean",
      cuisineImportance: 3,
      stubbornnessLevel: 7,
    },
    {
      agentId: "u3",
      name: "Leo",
      hardConstraint: "None",
      constraintImportance: 1,
      preferredPriceTier: 4,
      priceImportance: 2,
      preferredCuisine: "American BBQ",
      cuisineImportance: 5,
      stubbornnessLevel: 3, // Very flexible
    },
  ];

  console.log("--- Multi-Agent Restaurant Discovery Session ---");
  console.log("Calculating Social Welfare for the group...\n");

  // Running the algorithm
  const topCandidates = await filterService.getTopCandidates(mockUsers, 5);

  if (topCandidates.length === 0) {
    console.log(
      "CRITICAL: The algorithm reached a dead-end with zero candidates.",
    );
    return;
  }

  console.log("Top Candidates Selected for Negotiation:");
  console.log("-----------------------------------------");

  topCandidates.forEach((candidate, index) => {
    // We expect the utility score to have small decimals due to the tie-breaker logic
    console.log(
      `${index + 1}. [Score: ${candidate.utilityScore.toFixed(3)}] ${candidate.name}`,
    );
    console.log(
      `   Cuisine: ${candidate.cuisineType} | Price: ${candidate.priceTier} | Google Rating: ${candidate.rating}`,
    );
    console.log(`   Attributes: ${candidate.attributes.join(", ")}\n`);
  });
}

main().catch((err: unknown) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
