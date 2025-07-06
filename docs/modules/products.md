# Products Module

The `products` module manages the products available for sale in the application.

## Functionality

-   **CRUD Operations:** Provides standard Create, Read, Update, and Delete operations for products.
-   **Random Fetching:**
    -   `getRandomProducts`: Fetches a specified number of random products, useful for homepage displays.
-   **Name-Based Search:**
    -   `getProductsByName`: Retrieves products that match a given list of names.

## Endpoints

-   `POST /products`: Creates a new product.
-   `GET /products`: Retrieves all products with filtering and pagination.
-- `GET /products/random`: Retrieves a random selection of products.
-   `POST /products/names`: Retrieves products by their names.
-   `GET /products/:id`: Retrieves a single product by its ID.
-   `PATCH /products/:id`: Updates a product's information.
-   `DELETE /products/:id`: Deletes a product.

## Schema (`product.schema.ts`)

The `Product` schema defines the structure of a product document, including fields for `name`, `description`, `pricing`, `image`, and `categories`.
