# Migration Todo List: Express to NestJS

This file lists the step-by-step tasks required to migrate the backend from Express to NestJS.

## Phase 1: Core Setup

- [x] Initialize NestJS project (`nest new nest-backend`)
- [x] Install necessary dependencies:
    - [x] `@nestjs/config` for environment variables
    - [x] `@nestjs/mongoose` and `mongoose` for database
    - [x] `class-validator` and `class-transformer` for validation
- [x] Configure environment variables using `@nestjs/config`.
- [x] Set up the main database connection in `app.module.ts`.

## Phase 2: User Feature Migration

- [x] Create a `users` module (`nest g module users`).
- [x] Create a `users` controller (`nest g controller users`).
- [x] Create a `users` service (`nest g service users`).
- [x] Move `UserSchema.ts` to `src/users/schemas/user.schema.ts`.
- [x] Update the User schema to use NestJS/Mongoose decorators.
- [x] Migrate `UserDal.ts` logic to `users.service.ts`.
- [x] Migrate `UserService.ts` logic to `users.service.ts`.
- [x] Migrate `User.controller.ts` and `UserRoute.ts` to `users.controller.ts`.
- [x] Implement validation using DTOs and `ValidationPipe`.
- [x] Write unit/integration tests for the `users` module.

## Phase 3: Product Feature Migration

- [x] Create a `products` module.
- [x] Create a `products` controller.
- [x] Create a `products` service.
- [x] Move `ProductSchema.ts` to `src/products/schemas/product.schema.ts`.
- [x] Update the Product schema.
- [x] Migrate `ProductDal.ts` to `products.service.ts`.
- [x] Migrate `ProductService.ts` to `products.service.ts`.
- [x] Migrate `ProductController.ts` and `ProductRoute.ts` to `products.controller.ts`.
- [x] Implement validation for product-related endpoints.
- [x] Write tests for the `products` module.

## Phase 4: Recipe Feature Migration

- [x] Create a `recipes` module.
- [x] Create a `recipes` controller.
- [x] Create a `recipes` service.
- [x] Move `RecipeSchema.ts` to `src/recipes/schemas/recipe.schema.ts`.
- [x] Update the Recipe schema.
- [x] Migrate `RecipeDal.ts` to `recipes.service.ts`.
- [x] Migrate `RecipeService.ts` to `recipes.service.ts`.
- [x] Migrate `RecipeController.ts` and `RecipeRoutes.ts` to `recipes.controller.ts`.
- [x] Implement validation for recipe endpoints.
- [x] Write tests for the `recipes` module.

## Phase 5: Package Feature Migration

- [x] Create a `packages` module.
- [x] Create a `packages` controller.
- [x] Create a `packages` service.
- [x] Move `PackageSchema.ts` to `src/packages/schemas/package.schema.ts`.
- [x] Update the Package schema.
- [x] Migrate `PackageDal.ts` to `packages.service.ts`.
- [x] Migrate `PackageService.ts` to `packages.service.ts`.
- [x] Migrate `PackageController.ts` and `PackageRoute.ts` to `packages.controller.ts`.
- [x] Implement validation for package endpoints.
- [x] Write tests for the `packages` module.

## Phase 6: Order Feature Migration

- [x] Create an `orders` module.
- [x] Create an `orders` controller.
- [x] Create an `orders` service.
- [x] Move `OrderSchema.ts` to `src/orders/schemas/order.schema.ts`.
- [x] Update the Order schema.
- [x] Migrate `OrderDal.ts` to `orders.service.ts`.
- [x] Migrate `OrderService.ts` to `orders.service.ts`.
- [x] Migrate `OrderController.ts` and `OrderRoute.ts` to `orders.controller.ts`.
- [x] Implement validation for order endpoints.
- [x] Write tests for the `orders` module.

## Phase 7: Finalization

- [x] Review and refactor all migrated code.
- [x] Remove any leftover files from the old structure.
- [ ] Update API documentation (if any).
- [x] Perform end-to-end testing of the entire application.
- [ ] Deploy the new NestJS backend.
