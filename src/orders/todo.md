# Order Feature Migration - Remaining Tasks

This file outlines the necessary steps to complete the migration of the order and payment processing functionality.

## 1. Payment Provider Integration (PayPlus)

The core logic for communicating with the external payment provider needs to be implemented.

- [x] **Configure Credentials:**
    - [x] Add `PAYPLUS_API_KEY`, `PAYPLUS_SECRET_KEY`, and other necessary credentials to the `.env` file in the `nest-backend` root.
    - [x] Ensure the `@nestjs/config` module loads these variables.

- [x] **Create a Payment Service:**
    - [x] Create a new service or utility (e.g., `payment.service.ts` or `payplus.helper.ts`) to encapsulate all logic for interacting with the PayPlus API. This keeps the `OrdersService` clean and focused on business logic.

- [x] **Implement Payment Link Generation:**
    - [x] Implement the `getPaymentLink` method in `OrdersService`.
    - [x] This service method should call the new payment service to construct the payload and request a payment URL from PayPlus.
    - [x] Create a new controller endpoint (e.g., `POST /orders/generate-sale`) to expose this functionality.

## 2. Payment Notification Webhook

A webhook endpoint is required to receive real-time payment status updates from PayPlus.

- [x] **Create Webhook Endpoint:**
    - [x] Create a new controller endpoint (e.g., `POST /orders/notify`) to handle incoming webhook notifications. This endpoint should not have authentication guards as it will be called by an external service.

- [x] **Implement Payment Status Update Logic:**
    - [x] Implement an `updatePaymentStatus` method in `OrdersService`.
    - [x] This method will receive the transaction data from the webhook, find the corresponding order in the database, and update its `status` and `paymentDetails` fields.
    - [x] The logic inside the `/notify` endpoint will parse the request body and call this service method.

## 3. Related Cart Functionality

The cart logic is part of the `users` module but is essential for creating an order.

- [x] **Implement Cart Methods in `UsersService`:**
    - [x] Migrate the `addToCart` logic from the old `UserDal` into the `UsersService`.
    - [x] Migrate the `clearCart` logic.
    - [x] Expose these methods through the `UsersController`.

## 4. Testing

Thorough testing is required to ensure the entire workflow is reliable.

- [ ] **Unit Tests:**
    - [ ] Write unit tests for the `getPaymentLink` and `updatePaymentStatus` methods in `OrdersService`. Be sure to mock the payment service dependency.

- [ ] **End-to-End (E2E) Tests:**
    - [ ] Create an E2E test file for the complete order workflow.
    - [ ] The test should simulate:
        1. Adding an item to a user's cart.
        2. Creating an order and receiving a mock payment link.
        3. Simulating a call to the `/notify` webhook with a successful payment payload.
        4. Verifying that the order's status in the database is updated to `paid`.
