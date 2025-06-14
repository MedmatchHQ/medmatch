### Overview

Our approach to input validation relies heavily on **middleware**. This middleware acts as a gatekeeper, processing incoming requests and validating their parameters before they ever reach the controller layer. This allows controllers and services to assume that all incoming data is valid and correctly structured, simplifying their implementation and reducing the need for redundant checks.

???+ note "Importance of Testing"
    Since controllers rely on the integrity of input validation, thorough testing of the middleware is important. If input validation fails to catch invalid data, it can lead to unexpected behavior or even security vulnerabilities within the application.

### Validation Libraries

Medmatch utilizes two primary libraries for input validation:

1.  **`express-validator`**: Primarily used for validating non-body parameters such as path parameters, query parameters, and miscellaneous body fields that are not ideally handled by class-validator.
2.  **`class-validator`**: Used for robust of request bodies, leveraging TypeScript classes and decorators.

### Request Body Validation with `class-validator`

`class-validator` is great for validating structured data like request bodies, since it matches json to a class object. We will talk more about how to create validators in the `utils` section.

Our backend provides helper functions that abstract away the boilerplate of `class-validator` integration, making it straightforward to apply body validation. For example, the `validateBody` function creates a request handler that validates the body based on the provided validator. Below is an example for creating a user:
```typescript linenums="1" title="user.router.ts"
userRouter.post(
    "/",
    validation(validateBody(UserValidator)),
    userController.createUser
);
```
Other important helper functions are `validatePartialBody`, which only validates present body fields against the provided validator (useful for `PATCH` routes), and `validateFile`. 

???+ info "The `validation` Function"
    All validation middleware must be wrapped in the `validation` function. This ensures that all errors are properly aggregated and sent to the error handler if necessary

Feel free to take a look at the `class-validator` [docs](https://github.com/typestack/class-validator?tab=readme-ov-file#validation-errors), although some more details will be given in the `utils` section.

### Non-Body Parameter Validation with `express-validator`

While `class-validator` is great for body validation, `express-validator` is better for validating other parts of the request, such as path and query parameters.

`express-validator` is particularly useful for common validations like ensuring an ID is a valid MongoDB ObjectId or checking if a parameter is an integer. Helper functions are provided to simplify these common validation scenarios.

??? example "`validateId` Helper Function for Path Parameter"
    ```typescript linenums="1" title="user.router.ts"
    userRouter.get(
        "/:id",
        validation(validateId("id")),
        userController.getUserById
    );
    ```

For any other specific validation needs (e.g., cookies, unique query parameters, or complex path segment patterns), `express-validator` provides the flexibility to create custom validation chains.

Peruse the `express-validator` [docs](https://express-validator.github.io/docs/) for information on how to use it.

### Error Reporting to Client

When validation fails, all detected validation issues are collected, converted to `IValidationError`s and passed to the global error handler as an array. This array is then included in the API response, providing the client with a complete list of problems in a single request.

* **Combined Errors:** Both `class-validator` and `express-validator` errors are aggregated.
* **Full Visibility:** The client receives all validation errors upfront, eliminating the need for iterative trial-and-error debugging.