The **Service Layer** is the core of our application's business logic. It encapsulates all the operations required to fulfill a request, manage data, and enforce business rules, while knowing nothing about HTTP or how to connect to the database.

### Overview

Each module's service layer is defined as a **TypeScript class** within a file named `*.service.ts`. These service classes are designed to be highly focused on their specific domain (e.g., `UserService` for user-related operations).

A key principle of the service layer is **dependency injection**. Service classes receive the Mongoose models they depend on (e.g., `UserModel` for `UserService`) as parameters in their constructors. This design promotes testability and modularity, as dependencies can be easily swapped or mocked during testing.

### Responsibilities and Principles

The service layer adheres to strict principles to maintain a clean and maintainable architecture:

  * **Business Logic Encapsulation:** Services are solely responsible for implementing the application's business rules and logic. This includes data manipulation, complex computations, and coordinating operations across multiple data models.
  * **HTTP Agnosticism:** Service methods should have **no knowledge of HTTP** whatsoever. They should not directly access `req` or `res` objects, set HTTP status codes, or format HTTP responses. This strict separation ensures that the service layer remains reusable across different interfaces (e.g., an API, a command-line tool, or another service).
  * **Custom Error Throwing:** As detailed in the [Error Handling](error_handling.md) section, services are the primary place where **custom `HttpError` objects** are thrown. If a business logic error occurs (e.g., a user is not found, or an email already exists), the service will throw a specific custom error (e.g., `UserNotFoundError`, `ConflictError`). This allows the global error handler to translate these logical errors into appropriate HTTP responses.
      * **Module-Specific Errors:** For each new module, corresponding custom errors (e.g., `PostNotFoundError`, `CommentUnauthorizedError`) should be defined. This makes error identification clear and enables precise client-side handling.
  * **Input and Output:** Service methods should take **specific parameters** as input, rather than a generic `Request` object. They should always return **Data Transfer Objects (DTOs)**, not raw Mongoose documents. This ensures that the data leaving the service layer is clean, formatted for API consumption, and free of database-specific artifacts.

??? example "User Service Example"
    ```typescript linenums="1" title="user.service.ts"

    class UserService {
        constructor(private userModel: Model<UserSchema>) {}

        async getUserById(userId: string): Promise<User> {
            const doc = await this.userModel
                .findById<UserDoc>(userId)
                .populate("profile.files")
                .exec();
            if (!doc) {
                throw new UserNotFoundError(`User with id ${userId} not found`);
            }
            return User.fromDoc(doc);
        }

        /* ...more methods... */
    }
    ```

### Documentation

Every service method **must be thoroughly documented** with JSDoc. This documentation should include:

  * A clear and concise **description** of what the method does.
  * A list of all **parameters**, including their types and descriptions.
  * The **return type** and a description of what is returned.
  * A list of all **custom errors** that the method is capable of throwing, along with conditions under which they are thrown.

??? example "Proper Documentation Example"
    ```typescript linenums="1" title="user.service.ts"

    /**
    * Gets a single user by unique id
    * @param userId Mongoose user id
    * @returns The user object with given id if present
    * @throws A {@link UserNotFoundError} if the user with provided id is not found
    */
    async getUserById(userId: string): Promise<User> {
        const doc = await this.userModel
            .findById<UserDoc>(userId)
            .populate("profile.files")
            .exec();
        if (!doc) {
            throw new UserNotFoundError(`User with id ${userId} not found`);
        }
        return User.fromDoc(doc);
    }
    ```