// src/core/services/RestaurantFilterService.ts
import { IRestaurantRepository } from "../interfaces/IRestaurantRepository.js";
import {
  Restaurant,
  UserPreference,
  DietaryConstraint,
} from "../domain/types.js";

/**
 * ScoredRestaurant extends the base Restaurant with its calculated utility score.
 */
export type ScoredRestaurant = Restaurant & { utilityScore: number };

export class RestaurantFilterService {
  constructor(private restaurantRepo: IRestaurantRepository) {}

  /**
   * Orchestrates the candidate selection process:
   * 1. Hard filtering.
   * 2. Iterative greedy relaxation if no matches are found.
   * 3. Social welfare utility scoring with a rating tie-breaker.
   */
  async getTopCandidates(
    users: UserPreference[],
    limit: number = 5,
  ): Promise<ScoredRestaurant[]> {
    // Step 1: Initialize current constraints based on all users.
    let activeConstraints = Array.from(
      new Set(users.map((u) => u.hardConstraint).filter((c) => c !== "None")),
    );

    let candidates =
      await this.restaurantRepo.getRestaurantsByConstraints(activeConstraints);

    // Step 2: Greedy Constraint Relaxation
    // If no restaurants match, we drop the "cheapest" constraint iteratively.
    while (candidates.length === 0 && activeConstraints.length > 0) {
      console.warn(
        `[FilterService] No matches for: ${activeConstraints.join(", ")}. Relaxing...`,
      );

      const constraintToDrop = this.findCheapestConstraintToDrop(
        activeConstraints,
        users,
      );
      activeConstraints = activeConstraints.filter(
        (c) => c !== constraintToDrop,
      );

      candidates =
        await this.restaurantRepo.getRestaurantsByConstraints(
          activeConstraints,
        );
    }

    // Step 3: Social Welfare Scoring
    const scoredCandidates: ScoredRestaurant[] = candidates.map((rest) => {
      let groupUtility = 0;
      users.forEach((user) => {
        groupUtility += this.calculateIndividualUtility(user, rest);
      });

      // Tie-breaker implementation: Utility + (Rating / 100)
      // This ensures the internet rating only influences the outcome when utilities are equal.
      const finalScore = groupUtility / users.length + rest.rating / 100;

      return { ...rest, utilityScore: finalScore };
    });

    // Step 4: Sorting and Returning Top K
    return scoredCandidates
      .sort((a, b) => b.utilityScore - a.utilityScore)
      .slice(0, limit);
  }

  /**
   * Calculates the 'cost' of dropping each constraint.
   * Cost(c) = Σ (user.constraintImportance * user.stubbornnessLevel) for all users requiring constraint c.
   */
  private findCheapestConstraintToDrop(
    activeConstraints: DietaryConstraint[],
    users: UserPreference[],
  ): DietaryConstraint {
    let cheapestConstraint = activeConstraints[0];
    let minCost = Infinity;

    activeConstraints.forEach((constraint) => {
      const cost = users
        .filter((u) => u.hardConstraint === constraint)
        .reduce(
          (sum, u) => sum + u.constraintImportance * u.stubbornnessLevel,
          0,
        );

      if (cost < minCost) {
        minCost = cost;
        cheapestConstraint = constraint;
      }
    });

    return cheapestConstraint;
  }

  /**
   * Utility Function based on user preferences.
   * Score = (PriceMatch * Weight) + (CuisineMatch * Weight)
   */
  private calculateIndividualUtility(
    user: UserPreference,
    rest: Restaurant,
  ): number {
    let utility = 0;

    // Budget match
    if (rest.priceTier <= user.preferredPriceTier) {
      utility += user.priceImportance;
    }

    // Cuisine preference match
    if (
      rest.cuisineType.toLowerCase() === user.preferredCuisine.toLowerCase()
    ) {
      utility += user.cuisineImportance;
    }

    return utility;
  }
}
