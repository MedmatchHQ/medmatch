The **Controller Layer** is the entry point for all incoming HTTP requests in Medmatch. Its primary role is to manage HTTP concerns and delegate business logic to the appropriate service. Controllers are intentionally designed to be thin, focusing on request handling rather than complex data manipulation.

### Overview

Controllers handle all aspects related to the HTTP request and response cycle. This includes:

* **Extracting Request Data:** Pulling parameters from the request, such as path parameters (`req.params`), query parameters (`req.query`), and request body (`req.body`).
* **Managing Cookies and Files:** Handling operations related to HTTP cookies and incoming file uploads.
* **Configuring Responses:** Setting HTTP status codes, headers, and formatting the final JSON response object.

Crucially, controllers **should not contain business logic** or directly interact with the database (i.e., they should not have direct access to Mongoose models). Instead, all business logic is performed by calling functions from injected service dependencies.

### Dependency Injection

To facilitate the delegation of business logic, controllers receive the **services they depend on** as constructor parameters. This practice, known as dependency injection, makes controllers highly testable and promotes modularity by clearly defining their external requirements.

### Controller Method Decorator

Every controller method **must** be adorned with the `@ControllerMethod` decorator. This decorator is crucial for two main reasons:

1.  **Error Handling Integration:** It automatically catches any errors thrown by the controller method (or by the service functions it calls) and forwards them to the global error handler. This offloads error-to-HTTP-response conversion from the controller, keeping its code clean and focused on request processing.
2.  **`this` Binding:** The decorator handles the binding of `this` context to the class instance for the method call. If you ever get an error similar to `Cannot read properties of undefined (reading this)`, chances are you forget the `ControllerMethod` decorator.

??? info "The `@ControllerMethod` Decorator"
    The `@ControllerMethod` decorator routes any thrown errors to the error handler. You can think of it as equivalently doing the following:

    ```typescript linenums="1"
    try {
        /* function implementation */
    } catch (err) {
        next(err);
    }
    ```

??? example "User Controller Example"
    ```typescript linenums="1" title="user.controller.ts"
    class UserController {
        constructor(private userService: UserService) {}

        @ControllerMethod()
        async getUserById(req: Request, res: Response): Promise<void> {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);
            res.status(200).json({
                status: "success",
                data: user,
                message: `User with id ${user.id} retrieved successfully`,
            });
        }

        /* ...more methods... */
    }
    ```

### Documentation

Every controller method **must be thoroughly documented** using JSDoc. This documentation is crucial for understanding the API's behavior from the client's perspective and for future development. It should include:

* A clear and concise **description** of the function/route's purpose.
* A list of all **parameters**, including path parameters, query parameters, and request body parameters, along with their types and descriptions.
* A list of all possible **HTTP status codes** the endpoint can return on success or failure.
* A list of all **custom errors** that can be thrown either directly by the controller or by the service functions it calls, along with the conditions under which they are thrown.
* The **return type** for a successful response, specifically describing the structure of the data field.

??? example "Proper Documentation Example"
    ```typescript linenums="1" title="user.controller.ts"
    /**
    * Gets a single user by the provided id
    * @param {string} req.params.id User id
    * @returns A user with the corresponding id
    * @codes 200, 404
    * @throws A {@link UserNotFoundError} if a user with the corresponding id does not exist
    */
    @ControllerMethod()
        async getUserById(req: Request, res: Response): Promise<void> {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);
            res.status(200).json({
                status: "success",
                data: user,
                message: `User with id ${user.id} retrieved successfully`,
            });
        }
    ```