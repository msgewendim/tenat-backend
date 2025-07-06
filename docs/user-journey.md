# User Journey: The Order Workflow

This document describes the end-to-end user journey for placing an order, from adding an item to the cart to a successful payment.

## 1. Adding an Item to the Cart

-   **Action:** The user adds a product to their shopping cart.
-   **Endpoint:** `POST /users/:id/cart`
-   **Process:**
    1.  The `UsersController` receives the request with the user's ID and a `CartItemDto` in the request body.
    2.  The controller calls the `addToCart` method in the `UsersService`.
    3.  The `UsersService` finds the user in the database and pushes the new cart item into their `cart` array.

## 2. Creating an Order and Initiating Payment

-   **Action:** The user proceeds to checkout and submits their order.
-   **Endpoint:** `POST /orders/generate-sale`
-   **Process:**
    1.  The `OrdersController` receives the request with a `CreateOrderDto` containing the customer's details and the items in their cart.
    2.  The controller calls the `getPaymentLink` method in the `OrdersService`.
    3.  The `OrdersService` first creates a new order in the database with a `status` of `"pending"`.
    4.  It then calls the `PaymentService` to request a payment link from the external PayPlus API.
    5.  The payment link is returned to the user, who is then redirected to the payment page.

## 3. Payment Notification (Webhook)

-   **Action:** The user completes the payment on the external payment page, and PayPlus sends a notification to our backend.
-   **Endpoint:** `POST /orders/notify`
-   **Process:**
    1.  The `OrdersController` receives the webhook notification from PayPlus.
    2.  The controller calls the `updatePaymentStatus` method in the `OrdersService`.
    3.  The `OrdersService` finds the corresponding order by its ID and updates its `status` to `"paid"` or `"failed"` based on the webhook data. It also stores the transaction details in the `paymentDetails` field.

## 4. Verifying the Order

-   **Action:** The user can view their completed order.
-   **Endpoint:** `GET /orders/:id`
-   **Process:**
    1.  The `OrdersController` receives the request with the order's ID.
    2.  The controller calls the `findOne` method in the `OrdersService`.
    3.  The `OrdersService` fetches the order from the database, which now has a `status` of `"paid"`, and returns it to the user.
