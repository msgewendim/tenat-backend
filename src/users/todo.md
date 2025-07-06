# Users Module - Remaining Tasks

This file outlines the necessary features to be migrated to complete the `users` module functionality.

## 1. Cart Management

The logic for managing a user's shopping cart is a critical part of the e-commerce flow and is currently missing.

- [ ] **Implement `addToCart` Method:**
    - [ ] Create an `addToCart` method in `users.service.ts`.
    - [ ] This method should take a `userId` and a `cartItem` DTO as arguments.
    - [ ] It should use `findByIdAndUpdate` with the `$push` operator to add the item to the user's `cart` array in the database.
    - [ ] Create a corresponding `POST` or `PATCH` endpoint in `users.controller.ts` (e.g., `/users/:id/cart`).

- [ ] **Implement `clearCart` Method:**
    - [ ] Create a `clearCart` method in `users.service.ts`.
    - [ ] This method should take a `userId` and set the `cart` array to empty.
    - [ ] Create a corresponding `DELETE` endpoint in `users.controller.ts` (e.g., `/users/:id/cart`).

## 2. Form Submissions

The old backend had several endpoints for handling various form submissions. These are separate from the main user model but were handled by the `UserController`. In NestJS, these could be in their own module or handled here.

- [ ] **Newsletter Subscription:**
    - [ ] Create a new schema and service for `newsletter` subscribers.
    - [ ] Implement an `addToNewsletter` method in a new `NewsletterService`.
    - [ ] Create a `POST /newsletter` endpoint in a new `NewsletterController`.

- [ ] **Early Adopter Form:**
    - [ ] Create a new schema and service for `early-adopters`.
    - [ ] Implement an `addToEarlyAdopters` method.
    - [ ] Create a `POST /early-adopters` endpoint.

- [ ] **Design Product Form:**
    - [ ] Create a new schema and service for `design-product` submissions.
    - [ ] Implement an `addToDesignProduct` method.
    - [ ] Create a `POST /design-product` endpoint.
