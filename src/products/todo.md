# Products Module - Remaining Tasks

This file outlines the necessary features to be migrated to complete the `products` module functionality.

## 1. Additional Query Methods

The core CRUD (Create, Read, Update, Delete) operations are complete, but the original backend had additional ways to query products.

- [x] **Implement `getRandomProducts` Method:**
    - [x] Create a `getRandomProducts` method in `products.service.ts`.
    - [x] This method should fetch a random assortment of products, possibly using an aggregation pipeline with `$sample`.
    - [x] It should support pagination (`page`, `limit`).
    - [x] Create a corresponding `GET /products/random` endpoint in `products.controller.ts`.

- [x] **Implement `getProductsByName` Method:**
    - [x] Create a `getProductsByName` method in `products.service.ts`.
    - [x] This method should accept an array of product names and return matching products.
    - [x] Create a corresponding `POST /products/names` endpoint in `products.controller.ts` that accepts the names in the request body.
