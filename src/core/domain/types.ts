// src/core/domain/types.ts

export type DietaryConstraint =
  | "Kosher"
  | "Vegan"
  | "Vegetarian"
  | "Gluten_Free"
  | "None";

export type PriceTier = 1 | 2 | 3 | 4;

// רמת חשיבות מ-1 (לא חשוב) עד 5 (קריטי)
export type ImportanceScore = 1 | 2 | 3 | 4 | 5;

export interface Restaurant {
  id: string;
  name: string;
  cuisineType: string;
  priceTier: PriceTier;
  attributes: DietaryConstraint[];
  rating: number; // דירוג כללי של המסעדה (למשל מ-Google/Yelp)
}

export interface UserPreference {
  agentId: string;
  name: string;

  // אילוץ תזונתי - עדיין מוגדר כ-Hard, אבל עם מדד חשיבות לרלקסציה
  hardConstraint: DietaryConstraint;
  constraintImportance: ImportanceScore;

  // העדפות תקציב עם משקל
  preferredPriceTier: PriceTier;
  priceImportance: ImportanceScore;

  // העדפות מטבח עם משקל
  preferredCuisine: string;
  cuisineImportance: ImportanceScore;

  // רמת עקשנות כללית במשא ומתן (1-10)
  stubbornnessLevel: number;
}

// אובייקט עזר לניהול מצב המשא ומתן (State)
export interface NegotiationState {
  iteration: number;
  proposedRestaurantIds: string[]; // מסעדות שכבר הוצעו ונפסלו
  isConsensusReached: boolean;
}
