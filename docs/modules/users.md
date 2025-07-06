# Users Module

The `users` module is responsible for managing user data, including authentication information and shopping carts.

## Functionality

-   **CRUD Operations:** Provides standard Create, Read, Update, and Delete operations for users.
-   **Cart Management:**
    -   `addToCart`: Adds a specified product to a user's cart.
    -   `clearCart`: Empties all items from a user's cart.

## Endpoints

-   `POST /users`: Creates a new user.
-   `GET /users`: Retrieves all users.
-   `GET /users/:id`: Retrieves a single user by their ID.
-   `PATCH /users/:id`: Updates a user's information.
-   `DELETE /users/:id`: Deletes a user.
-   `POST /users/:id/cart`: Adds an item to a user's cart.
-   `DELETE /users/:id/cart`: Clears a user's cart.

## Schema (`user.schema.ts`)

The `User` schema defines the structure of a user document in the database, including fields for `name`, `email`, `address`, `role`, and a `cart` array.

## DTOs

-   `create-user.dto.ts`: Defines the shape and validation rules for creating a new user.
-   `update-user.dto.ts`: Defines the shape and validation rules for updating a user.
-   `cart-item.dto.ts`: Defines the shape of a single item in the shopping cart.
