# Recipes Module

The `recipes` module manages the recipes that can be viewed in the application.

## Functionality

-   **CRUD Operations:** Provides standard Create, Read, Update, and Delete operations for recipes.
-   **Random Fetching:**
    -   `getRandomRecipes`: Fetches a specified number of random recipes.
-   **Name-Based Search:**
    -   `getRecipesByName`: Retrieves recipes that match a given name.

## Endpoints

-   `POST /recipes`: Creates a new recipe.
-   `GET /recipes`: Retrieves all recipes with filtering and pagination.
-   `GET /recipes/random`: Retrieves a random selection of recipes.
-   `GET /recipes/names`: Retrieves recipes by their names.
-   `GET /recipes/:id`: Retrieves a single recipe by its ID.
-   `PATCH /recipes/:id`: Updates a recipe's information.
-   `DELETE /recipes/:id`: Deletes a recipe.

## Schema (`recipe.schema.ts`)

The `Recipe` schema defines the structure of a recipe document, including fields for `name`, `description`, `ingredients`, `instructions`, and `prepTime`.
