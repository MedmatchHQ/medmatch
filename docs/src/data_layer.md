The **Data Layer**, also referred to as the persistence layer, is where we define how our application interacts with the MongoDB database using Mongoose. This layer is primarily concerned with data modeling and providing basic database interaction methods.

### Overview

Each feature module in Medmatch will have a file ending with `.model.ts`. These files are dedicated to defining the schema, Mongoose model, and all associated TypeScript types necessary for representing data entities within the database.

### Schema Definition

The **Schema** is the blueprint for our data. It defines the shape of the documents we store in MongoDB, specifying the fields, their types, validation rules (like `required`), default values, and other Mongoose-specific options.

??? example "User Schema Example"
    ```typescript linenums="1" title="user.model.ts"
    const userSchema = new Schema({
        first: { type: String, required: true },
        last: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        entryDate: { type: Date, default: () => Date.now() },
    });

    type UserSchema = InferSchemaType<typeof userSchema>;
    ```

### Mongoose Model

The **Mongoose Model** is created based on the defined schema and serves as our direct interface for database operations. It provides methods (like `find`, `findById`, `create`, `updateOne`, `deleteOne`, etc.) that allow us to perform CRUD (Create, Read, Update, Delete) operations on the MongoDB collection.

??? example "User Model Creation"
    ```typescript linenums="1" title="user.model.ts"
    const UserModel = mongoose.model<UserSchema>("User", userSchema, "users");
    ```

### Data Representations: Documents vs. Data Transfer Objects (DTOs)

Within our codebase, we handle two primary representations of data for each entity:

1.  **Document (e.g., `IUserDoc`)**: This is the raw data shape returned directly from a MongoDB query by Mongoose. A document includes all database fields (like `_id`, `__v`), as well as any Mongoose-specific methods (e.g., `save()`, `populate()`). We **do not** return documents directly from our API. This is because documents might contain sensitive fields, or their structure might not be optimal for API responses.
2.  **Data Transfer Object (DTO)**: This is the simplified, clean data structure that our API actually returns to clients. A DTO only contains the fields explicitly intended for the client, excluding internal database fields or Mongoose methods. DTOs are defined as TypeScript classes.

The conversion from a Mongoose Document to a DTO is a crucial step that happens before a response is sent. Each DTO class should have a `static` method (commonly named `fromDocument`) responsible for this conversion.

??? example "User DTO Example"
    ```typescript linenums="1" title="user.model.ts"
    // ... (Schema and Model definitions)

    // User DTO
    export class User {
      constructor(
        public id: string, // Renamed _id to id for client consumption
        public email: string,
        public firstName: string,
        public lastName: string,
        // Public properties for the API response
      ) {}

      /**
       * Converts a Mongoose IUserDoc to a User DTO.
       * @param doc The Mongoose user document.
       * @returns A User Data Transfer Object.
       */
      public static fromDocument(doc: IUserDoc): User {
        return new User(
          doc._id.toString(), // Convert ObjectId to string
          doc.email,
          doc.firstName,
          doc.lastName
        );
      }
    }
    ```

#### Naming Conventions for Data Representations

To maintain consistency:

* **Document Interface**: Should be named `I[EntityName]Doc` (e.g., `IUserDoc`).
* **Mongoose Model**: Should be `[EntityName]Model` (e.g., `UserModel`).
* **DTO Class**: Should simply be `[EntityName]` (e.g., `User`).

### Additional Types

Beyond the core Document and DTO types, you'll often find other types defined in `.model.ts` files to facilitate specific operations:

* **Input Types**: Separate types are defined for request payloads, particularly for creation (`Create[EntityName]Dto`) or update (`Update[EntityName]Dto`) operations. These types exclude fields that shouldn't be provided by the client (e.g., `_id`, timestamps, or certain sensitive fields).

    ??? example "Create User DTO"
        ```typescript linenums="1" title="user.model.ts"
        // ... (other types and classes)

        export interface CreateUserDto {
          email: string;
          passwordPlain: string; // Plain password before hashing
          firstName: string;
          lastName: string;
        }

        export interface UpdateUserDto {
          email?: string;
          firstName?: string;
          lastName?: string;
          // Only include fields that can be updated by the client
        }
        ```

* **Populated Documents**: Mongoose allows for referencing documents in other collections (population). DTOs will almost always represent populated data. However, for internal consistency and to allow for flexible data retrieval, we also define types for both unpopulated and fully populated documents.

    When querying the database, the returned Mongoose Document type (`IUserDoc` in the example above) should generally reflect the *populated* state. This means the default type alias for a Mongoose model will expect populated fields.

    ??? info "The `Model<T, QueryHelpers, TMethodsAndStatics, VType>` override"
        For certain schema structures, Mongoose's default type inference for populated fields might not align perfectly with our needs. In such cases, you might use the `Model<T, QueryHelpers, TMethodsAndStatics, VType>` override when defining the Mongoose model to explicitly specify the hydrated (populated) type that will be returned by database queries. This ensures type correctness throughout the application.

        ```typescript linenums="1" title="user.model.ts"
        import { Schema, model, Document, PopulatedDoc, Types } from 'mongoose';
        import { IPostDoc } from './post.model'; // Assuming a post model

        // Define a User document that can have populated posts
        export interface IUserDocPopulated extends IUserDoc {
          posts: PopulatedDoc<IPostDoc & Document>; // 'posts' is now an array of populated Post documents
        }

        // When defining the model, you can specify the default return type
        export const UserModel = model<IUserDoc, {}, {}, {}, IUserDocPopulated>('User', UserSchema);
        // This indicates that queries on UserModel will typically return IUserDocPopulated
        // if population is applied.
        ```
    It's important to note that the decision to always return fully populated DTOs or to return IDs and allow for client-side population is an area of ongoing consideration, balancing data completeness with potential performance implications.