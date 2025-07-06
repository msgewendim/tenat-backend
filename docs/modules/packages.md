# Packages Module

The `packages` module manages special product packages or bundles.

## Functionality

-   **CRUD Operations:** Provides standard Create, Read, Update, and Delete operations for packages.
-   **Random Fetching:**
    -   `getRandomPackages`: Fetches a specified number of random packages.

## Endpoints

-   `POST /packages`: Creates a new package.
-   `GET /packages`: Retrieves all packages with pagination.
-   `GET /packages/random`: Retrieves a random selection of packages.
-   `GET /packages/:id`: Retrieves a single package by its ID.
-   `PATCH /packages/:id`: Updates a package's information.
-   `DELETE /packages/:id`: Deletes a package.

## Schema (`package.schema.ts`)

The `Package` schema defines the structure of a package document, including fields for `name`, `price`, `image`, and `cookingTime`.
