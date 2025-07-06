# Folder Structure

This document outlines the folder structure of the NestJS backend, which is organized by feature modules to ensure scalability and maintainability.

## Root Directory

-   `src/`: Contains all the application source code.
-   `test/`: Contains all end-to-end (E2E) tests.
-   `docs/`: Contains all project documentation.
-   `.env`: Environment variables (database connection, API keys, etc.).
-   `nest-cli.json`: Configuration for the NestJS CLI.
-   `package.json`: Project dependencies and scripts.
-   `tsconfig.json`: TypeScript compiler configuration.

## `src/` Directory

The `src` directory is organized into feature modules, with each module encapsulating all the logic related to a specific domain.

### Core Application Files

-   `main.ts`: The entry point of the application. It initializes the NestJS app, sets up middleware (like Swagger), and starts the server.
-   `app.module.ts`: The root module of the application. It imports all the feature modules and global providers.
-   `app.controller.ts`: A basic controller for root-level requests.
-   `app.service.ts`: A basic service for root-level logic.

### Feature Module Structure (e.g., `src/users/`)

Each feature module follows a consistent structure:

-   `users.module.ts`: The module file, which imports the controller, service, and Mongoose schema.
-   `users.controller.ts`: The controller, which defines the API endpoints for the module and handles incoming requests.
-   `users.service.ts`: The service, which contains the business logic for the module and interacts with the database.
-   `schemas/`: A directory containing the Mongoose schema definition for the module's data model (e.g., `user.schema.ts`).
-   `dto/`: A directory containing Data Transfer Objects (DTOs) used for validating incoming request bodies.
-   `entities/`: A directory containing the TypeScript class representation of the module's data model.
-   `*.spec.ts`: Unit test files for the controller and service.
