### Overview

The main idea behind our error handler is instead of handling errors directly within controller or service functions by constructing HTTP responses, errors are propagated upwards until they reach a designated **global error handler**. This error handler is responsible for intercepting thrown errors and converting them into appropriate HTTP responses sent back to the client.

This design choice offers several benefits:

- **Decoupling:** Keeps HTTP-specific logic out of the service layer, maintaining a clear separation of concerns.
- **Reduced Boilerplate:** Minimizes redundant `if` statements, `try...catch` blocks, and error response construction across various controllers and services.
- **Improved Readability:** Allows controller and service functions to focus primarily on their core business logic.

### Custom Error Objects

To enable the error handler to construct precise HTTP responses, we utilize custom `HttpError` objects that extend TypeScript's built-in `Error` class (`HttpError` is a horrible name and it will hopefully be fixed soon). These custom errors are throwable just like standard errors but include additional parameters important for generating a meaningful API response.

`HttpError`'s important properties are:

- `status`: An HTTP status code (e.g., `404`, `409`, `200`).
- `details`: A human-readable message describing the error.
- `code`: A unique identifier for the specific error type from the `ErrorCode` enum (e.g., `USER_NOT_FOUND`, `CONFLICT`).

??? info "The `ErrorCode` enum"
    The `ErrorCode` enum contains all error codes that can come out of the API, including general error codes like a generic `INTERNAL_SERVER_ERROR` (represented by the `GeneralCode` sub-enum ), and more specialized codes such as `USER_NOT_FOUND` (from the `UserCode` sub-enum). 

??? example "`NotFoundError` Example"
    ```typescript linenums="1" title="errors.ts"
    class NotFoundError extends HttpError {
      constructor(
        public details: string,
        public code: ErrorCode = GeneralCode.NotFound,
        public status: number = 404
      ) {
        super(details, code, status);
      }
    }
    ```

??? info "Further Specializing Errors"
    Each module will typically further extend specific `HttpError`s for readability and the DRY principle. For example, the `User` module creates its own `UserNotFoundError`:

    ```typescript linenums="1" title="utils/user.errors.ts"
    class UserNotFoundError extends NotFoundError {
        constructor(message: string = "User not found") {
            super(message, UserCode.UserNotFound);
        }
    }
    ```

### Flow of Custom Errors

1.  **Service Layer:** The **Service Layer** is the primary location for throwing custom errors related to business logic or data integrity. For example, if a service attempts to retrieve a user from the database but the user is not found, it will throw a `UserNotFoundError`.
    ```typescript linenums="1" title="user.service.ts"
    async function getUserById(id: string): Promise<User> {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new UserNotFoundError(`User with ID ${id} not found.`);
      }
      return user;
    }
    ```
2.  **Controller Layer:** When a **Controller Layer** function calls a service function that might throw a custom error, the controller itself will **re-throw** this error. It does not attempt to handle the error by constructing a response. This allows the error to propagate up the call stack.

    ```typescript linenums="1" title="user.controller.ts"
    export class UserController {

      @ControllerMethod
      async getUser(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;
        // Any error thrown by this function is caught and sent to the error 
        // handler
        const user = await this.userService.getUserById(userId);
        return user;
      }
    }
    ```

    ??? info "The `@ControllerMethod` Decorator"
        The `@ContrllerMethod` decorator is what routes any thrown errors to the error handler. You can think of it as equivalently doing the following: 

        ```typescript linenums="1"
        try {
            /* function implementation */
        } catch (err) {
            next(err);
        }
        ```

        Truthfully, it has a little more functionality than just routing errors (which is why it's not called `@HandleErrors`), but that's frankly unimportant for these docs.

3.  **Global Error Handler:** The custom error is eventually caught by a dedicated Express error handling middleware. This middleware inspects the error:
    - If the error is an instance of `HttpError`, it extracts the `status`, `details`, and `code` and constructs an appropriate JSON HTTP response.
    - If a non-custom, generic `Error` (or any other unexpected type) is thrown, the handler defaults to a generic `500 Internal Server Error` response to prevent sensitive information leakage and ensure a consistent fallback.

    ??? note "Other Errors"
        The error handler will also handle other possible errors thrown by third party middleware, such as `MulterError`s.
