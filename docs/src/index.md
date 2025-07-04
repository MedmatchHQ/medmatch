## API Structure
This is a quick overview of how the entire API functions. For more in depth info on each topic, further explore the docs site.
### Layers
The API is built on a multi-layer architecture. An overview of each layer and its function:

* **Data Layer** - Defines models that represent how data is structured in the database, and provides methods for simple database actions.
* **Service Layer** - Interfaces with the database and returns data in a defined structure. If any data related errors (such as 404s and 409s) occur, this is where they are handled.
* **Controller Layer** - Handles core HTTP logic for the route, including extracting data from the request, performing the action requested via the injected service, and returning a response.
* **Router Layer** - Configures relevant services and controllers, defines the paths for each endpoint, and applies input validation and other middleware.

There are two other structures that contribute to the request flow of the API.
### Input Validation
All input validation is done through middleware, effectively creating a barrier to entry for the API layers. If any input validation errors are encountered through the process, they are automatically converted to an HTTP response and sent back to the client before the request reaches the controller.  
### Error Handling
If any errors occur within the controller logic, such as an absent document or an id conflict, a custom error is thrown, passed to the error handler, converted to an HTTP response, and sent to the client. This allows the controller to delegate most of the error logic to the error handler, with the HTTP configuration defined within the custom error class. This also keeps any HTTP logic out of the service layer, maintaining the desired amount of decoupling.
### Overview
Below is a diagram that details the flow of a request through the api  

![MedmatchAPI drawio (3)](resources\api_diagram.png)
## File Structure
The backend follows a modular structure, keeping all structures related to a certain feature nearby, within one directory. Each module follows a similar structure.

* ***.model.ts** - The data layer for the module. Contains relavent interfaces and `mongoose` models for the given feature.
* ***.service.ts** - The service layer for the module. Defines a service class and methods for the given feature.
* ***.controller.ts** - The controller layer for the module. Defines a controller class and request handlers for the given feature.
* ***.router.ts** - The router layer for the module. Configures the services, controllers, and routes for the given feature.
* utils
    * ***.errors.ts** - Defines custom errors thrown in the service, configured to be converted to an HTTP response.
    * ***.validator.ts** - Contains input validation logic and models for the given feature.