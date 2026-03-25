import { IRestaurantRepository } from "../../core/interfaces/IRestaurantRepository.js";
import { DietaryConstraint, Restaurant } from "../../core/domain/types.js";
import restaurantData from "../../data/restaurants.json" with { type: "json" };

export class MockRestaurantRepository implements IRestaurantRepository {
  private readonly restaurants: Restaurant[];

  constructor() {
    this.restaurants = restaurantData as Restaurant[];
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return this.restaurants;
  }

  async getRestaurantsByConstraints(
    constraints: DietaryConstraint[]
  ): Promise<Restaurant[]> {
    if (constraints.length === 0) {
      return this.restaurants;
    }

    return this.restaurants.filter((restaurant) =>
      constraints.every(
        (constraint) =>
          constraint === "None" || restaurant.attributes.includes(constraint)
      )
    );
  }
}
