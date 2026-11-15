# Bug Reports: Ella API

This document details the exploratory and technical bugs identified during the testing of the Ella API backend.

## Bug #1

**Title**
Application fails to compile in development mode due to TypeScript type mismatch in UsersService

**Severity**
Critical (Blocker)

**Preconditions**

* Clean clone of the repository

* Node.js and npm installed

* Dependencies installed via `npm install`

**Steps to Reproduce**

1. Navigate to the project root directory.

2. Execute the development start script: `npm run start:dev`

**Actual Result**
The application fails to start. The compiler throws `error TS2352` in `src/users/users.service.ts` at line 38, indicating that the `User` type conversion is invalid because the `createdAt` and `updatedAt` properties are missing.

**Expected Result**
The application should compile cleanly and the server should start on port 3000 without any TypeScript errors.

**Evidence**

```
[1:06:44 AM] Starting compilation in watch mode...
src/users/users.service.ts:38:17 - error TS2352: Conversion of type '{ id: number; transactions: never[]; name: string; email: string; }' to type 'User' may be a mistake...
Type '{ id: number; transactions: never[]; name: string; email: string; }' is missing the following properties from type 'User': createdAt, updatedAt

```

**Possible Root Cause**
The developer is attempting to bypass strict typing by casting an incomplete object as a `User`. The `User` interface likely requires `createdAt` and `updatedAt`, which are missing from the mapped data object.

## Bug #2

**Title**
Transaction can be created with non-existent user ID

**Severity**
High

**Preconditions**

* API is running and compiled successfully.

* At least one valid product exists in the database.

**Steps to Reproduce**

1. Send a `POST` request to `/transactions` with the following payload:

```
{
  "userId": 999999, 
  "productId": 1,
  "quantity": 1
}

```

*(Assuming user ID `999999` does not exist)*

**Actual Result**
The API returns a `201 Created` status and successfully generates a transaction record, despite the `userId` being invalid.

**Expected Result**
The API should return a `404 Not Found` or `400 Bad Request` stating that the user does not exist. The transaction should not be created.

**Evidence**
Response Payload:

```
{
  "id": 15,
  "userId": 999999,
  "productId": 1,
  "quantity": 1,
  "createdAt": "2023-10-25T12:00:00.000Z"
}

```

**Possible Root Cause**
The `TransactionsService` is not validating the existence of the `userId` against the `Users` table before inserting the record into the database, or the database is missing a foreign-key constraint on `userId`.

## Bug #3

**Title**
API allows creation of products with negative prices

**Severity**
High

**Preconditions**

* API is running.

**Steps to Reproduce**

1. Send a `POST` request to `/products` with a negative price value:

```
{
  "name": "Invalid Product",
  "description": "This product pays you to buy it",
  "price": -50.00,
  "stock": 10
}

```

**Actual Result**
The API returns a `201 Created` status and saves the product with a negative price.

**Expected Result**
The API should return a `400 Bad Request` with a validation error indicating that `price` must be a positive number.

**Possible Root Cause**
The `CreateProductDto` is missing validation decorators (e.g., class-validator's `@IsPositive()` or `@Min(0)`) on the `price` property.

## Bug #4

**Title**
System allows creation of duplicate users with the exact same email address

**Severity**
Medium

**Preconditions**

* API is running.

**Steps to Reproduce**

1. Send a `POST` request to `/users` with a valid email (e.g., `test@example.com`).

2. Observe the `201 Created` response.

3. Send the exact same `POST` request to `/users` again.

**Actual Result**
The API returns `201 Created` for the second request, resulting in two distinct user records sharing the same email address.

**Expected Result**
The API should return a `409 Conflict` (or `400 Bad Request`) stating that the email is already in use.

**Possible Root Cause**
There is no `@Unique()` constraint on the email column in the database entity, nor is there a validation check in the `UsersService` prior to creation.