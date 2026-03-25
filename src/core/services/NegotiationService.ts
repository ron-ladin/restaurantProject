import { ILLMProvider, NegotiationResult } from "../interfaces/ILLMProvider.js";
import { UserPreference, Restaurant } from "../domain/types.js";

export class NegotiationService {
  constructor(private llmProvider: ILLMProvider) {}

  async runNegotiation(
    users: UserPreference[],
    candidates: Restaurant[],
  ): Promise<NegotiationResult> {
    console.log(
      `[NegotiationService] Starting AI negotiation for ${users.length} users and ${candidates.length} candidates...`,
    );

    // Guardrail: Validate that we have candidates to negotiate on
    if (candidates.length === 0) {
      return {
        finalRestaurantId: null,
        consensusReached: false,
        satisfactionScores: {},
        transcript: [],
        summary: "No candidates available for negotiation.",
      };
    }

    // Call the AI provider (Strategy Pattern in action)
    const result = await this.llmProvider.negotiate({ users, candidates });

    // Validation: Ensure the AI chose a valid restaurant ID from the list
    const validIds = candidates.map((c) => c.id);
    if (
      result.finalRestaurantId &&
      !validIds.includes(result.finalRestaurantId)
    ) {
      console.warn(
        `[NegotiationService] AI chose invalid ID: ${result.finalRestaurantId}. Falling back to best mathematical match.`,
      );
      result.finalRestaurantId = validIds[0]; // Fallback to the top candidate from the filter
    }

    return result;
  }
}
