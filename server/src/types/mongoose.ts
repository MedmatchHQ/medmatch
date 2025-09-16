import { Model } from "mongoose";

/**
 * Replaces the types of the fields in `T` with the types in `U`
 * @example
 * ```js
 * interface User {
 *   name: string;
 *   age: number;
 *   profile: Types.ObjectId;
 *   image: Types.ObjectId;
 * }
 *
 * type PopulatedUser = Populated<User, { profile: Profile, image: File }>;
 * // PopulatedUser = { name: string, age: number, profile: Profile, image: File };
 * ```
 */
type Replace<
  T extends Record<string, any>,
  U extends Partial<Record<keyof T, any>>
> = Omit<T, keyof U> & U;

/**
 * Represents a `mongoose` Model with overwritten hydrated document type, for the purposes of Subdocument population.
 * Can't use if other Model generic types are needed.
 * @example
 * ```js
 * const profileSchema = new Schema({
 *   bio: { type: String },
 *   work: { type: String },
 * });
 *
 * const userSchema = new Schema({
 *   first: { type: String, required: true },
 *   last: { type: String, required: true },
 *   profile: { type: profileSchema, default: () => ({}) },
 * });
 *
 * interface Profile extends InferSchemaType<typeof profileSchema> {}
 * interface ProfileDoc extends HydratedDocument<Profile> {}
 *
 * interface User extends InferSchemaType<typeof userSchema> {
 *   profile: Profile;
 * }
 * interface UserDoc extends HydratedDocument<User> {
 *   profile: HydratedSingleSubdocument<ProfileDoc>;
 * }
 *
 * type UserModelType = ModelWithOverrides<User, UserDoc>;
 * ```
 */
type ModelWithOverrides<T, U> = Model<T, {}, {}, {}, U>;

export { ModelWithOverrides, Replace };
