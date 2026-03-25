import { MockRestaurantRepository } from "./infrastructure/database/MockRestaurantRepository.js";

async function main(): Promise<void> {
  const repository = new MockRestaurantRepository();

  console.log("Fetching all restaurants...\n");
  const allRestaurants = await repository.getAllRestaurants();
  console.log(JSON.stringify(allRestaurants, null, 2));
}

main().catch((err: unknown) => {
  console.error("Error:", err);
  process.exit(1);
});
