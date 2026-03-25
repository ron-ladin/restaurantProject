import { MockRestaurantRepository } from "./infrastructure/database/MockRestaurantRepository.js";

async function main(): Promise<void> {
  const repository = new MockRestaurantRepository();

  console.log("Fetching all restaurants...\n");
  const allRestaurants = await repository.getAllRestaurants();
  console.log("All Restaurants:");
  console.log(JSON.stringify(allRestaurants, null, 2));

  console.log("\nFetching Vegan restaurants...\n");
  const veganRestaurants = await repository.getRestaurantsByConstraints(["Vegan"]);
  console.log("Vegan Restaurants:");
  console.log(JSON.stringify(veganRestaurants, null, 2));
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
