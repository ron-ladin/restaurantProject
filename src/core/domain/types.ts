export type DietaryConstraint = "Kosher" | "Vegan" | "Vegetarian" | "Gluten_Free" | "None";

export type PriceTier = 1 | 2 | 3 | 4;

export interface Restaurant {
  id: string;
  name: string;
  cuisineType: string;
  priceTier: PriceTier;
  attributes: DietaryConstraint[];
  rating: number;
}

export interface UserPreference {
  agentId: string;
  name: string;
  budget: PriceTier;
  hardConstraint: DietaryConstraint;
  preferredCuisine: string;
  stubbornnessLevel: number;
}
