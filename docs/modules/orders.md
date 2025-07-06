# Orders Module

The `orders` module is the most critical part of the application, handling the entire checkout and payment process.

## Functionality

-   **Order Creation:** Creates a new order in the database with a `"pending"` status.
-   **Payment Link Generation:**
    -   `getPaymentLink`: Communicates with the external PayPlus API to generate a secure payment link for the user.
-   **Payment Status Updates:**
    -   `updatePaymentStatus`: Listens for webhook notifications from PayPlus to update the order's status to `"paid"` or `"failed"`.

## Endpoints

-   `POST /orders/create`: Creates a new order.
-   `POST /orders/generate-sale`: Creates an order and returns a payment link.
-   `POST /orders/notify`: The webhook endpoint for receiving payment status updates from PayPlus.
-   `GET /orders`: Retrieves all orders with pagination.
-   `GET /orders/:id`: Retrieves a single order by its ID.

## Sub-Modules

-   **`payments/`**: This directory contains the `PaymentService`, which encapsulates all logic for communicating with the PayPlus API. This separation of concerns keeps the main `OrdersService` clean and focused on the application's business logic.
