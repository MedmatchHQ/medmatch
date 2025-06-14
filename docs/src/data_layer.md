The **Data Layer**, also referred to as the persistence layer, is where we define how our application interacts with the MongoDB database using Mongoose. This layer is primarily concerned with data modeling and providing basic database interaction methods.

### Overview

Each feature module in Medmatch will have a file ending with `.model.ts`. These files are dedicated to defining the schema, Mongoose model, and all associated TypeScript types necessary for representing data entities within the database.

Visit the [Mongoose Docs](https://mongoosejs.com/docs/guide.html) for more in depth info about interactions with the database.

??? note "Examples in this doc"
    Most of the example code in this doc represents a users module, but it is not the same as the users module in the repo. The code included here is just to aid with how the general structure should look.

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

1.  **Document (e.g., `UserDoc`)**: This is the raw data shape returned directly from a MongoDB query by Mongoose. A document includes all database fields (like `_id`, `__v`), as well as any Mongoose-specific methods (e.g., `save()`, `populate()`). We **do not** return documents directly from our API. This is because documents might contain sensitive fields, or their structure might not be optimal for API responses.
2.  **Data Transfer Object (DTO e.g., `User`)**: This is the simplified, clean data structure that our API actually returns to clients. A DTO only contains the fields explicitly intended for the client, excluding internal database fields or Mongoose methods. DTOs are defined as TypeScript classes.

A Mongoose Document should always be converted to a DTO before a response is sent. Each DTO class should have a `static` method (commonly named `fromDocument`) responsible for this conversion.

??? example "User DTO Example"
    ```typescript linenums="1" title="user.model.ts"
    interface UserDoc extends HydratedDocument<UserSchema> {}

    class User implements UserSchema {
        constructor(
            public id: string,
            public first: string,
            public last: string,
            public email: string,
            public password: string,
            public entryDate: Date
        ) {}

        static fromDoc(doc: UserDoc): User {
            return new User(
                doc._id.toString(),
                doc.first,
                doc.last,
                doc.email,
                doc.password,
                doc.entryDate
            );
        }
    }
    ```

### Additional Types

Beyond the core Document and DTO types, you'll often find other types defined in `.model.ts` files to facilitate specific operations:

* **Input Types**: Separate types (e.g. `InputUser`) are defined for request payloads, particularly for creation and update operations. These types exclude fields that shouldn't be provided by the client (e.g., `_id`, timestamps, or certain sensitive fields).

    ??? example "Input User DTO"
        ```typescript linenums="1" title="user.model.ts"
        interface InputUser {
            first: string;
            last: string;
            email: string;
            password: string;
            entryDate: Date;
        }
        ```

        Or, in this case, equivalently:
        ```typescript linenums="1" title="user.model.ts"
        type InputUser = UserSchema
        ```

        Types for PATCH methods will typically be similar to `#!ts Partial<InputUser>`

* **Populated Documents**: Mongoose allows for referencing documents in other collections (population). DTOs will almost always represent populated data. However, for internal consistency and to allow for flexible data retrieval, we also define types for both unpopulated and fully populated documents.

    When querying the database, the returned Mongoose Document type (`UserDoc` in the example above) should generally reflect the *populated* state. This means the default type alias for a Mongoose model will expect populated fields.