# Recipes Module - Remaining Tasks

This file outlines the necessary features to be migrated to complete the `recipes` module functionality.

## 1. Additional Query Methods

The core CRUD (Create, Read, Update, Delete) operations are complete, but the original backend had additional ways to query recipes.

- [x] **Implement `getRandomRecipes` Method:**
    - [x] Create a `getRandomRecipes` method in `recipes.service.ts`.
    - [x] This method should fetch a random assortment of recipes, likely using an aggregation pipeline with `$sample`.
    - [x] It should support pagination (`page`, `limit`).
    - [x] Create a corresponding `GET /recipes/random` endpoint in `recipes.controller.ts`.

- [x] **Implement `getRecipesByName` Method:**
    - [x] Create a `getRecipesByName` method in `recipes.service.ts`.
    - [x] This method should accept a search string and return recipes with matching names.
    - [x] Create a corresponding `GET /recipes/names` endpoint in `recipes.controller.ts` that accepts the name as a query parameter.
