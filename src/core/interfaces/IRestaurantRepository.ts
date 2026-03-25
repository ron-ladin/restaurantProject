import type { DietaryConstraint, Restaurant } from "../domain/types.js";

export interface IRestaurantRepository {
  getAllRestaurants(): Promise<Restaurant[]>;
  getRestaurantsByConstraints(constraints: DietaryConstraint[]): Promise<Restaurant[]>;
}
