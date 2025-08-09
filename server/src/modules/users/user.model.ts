import { ModelWithOverrides, Replace } from "@/types/mongoose";
import mongoose, {
  Schema,
  HydratedDocument,
  InferSchemaType,
  HydratedSingleSubdocument,
} from "mongoose";
import { File, FileDoc } from "@/modules/files";

/** Mongoose schema definition for user profile */
const profileSchema = new Schema({
  bio: { type: String },
  work: { type: String },
  research: { type: String },
  volunteering: { type: String },
  files: { type: [Schema.Types.ObjectId], ref: "File", default: [] },
});

/** Mongoose schema definition for user */
const userSchema = new Schema({
  first: { type: String, required: true },
  last: { type: String, required: true },
  profile: { type: profileSchema, default: () => ({}) },
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  entryDate: { type: Date, default: () => Date.now() },
});

type ProfileSchema = InferSchemaType<typeof profileSchema>;

/**
 * An input object used when creating a profile.
 * Identical to {@link Profile} with no id, and an array of string
 * ObjectIds instead of {@link File} objects.
 */
interface InputProfile extends Replace<ProfileSchema, { files: string[] }> {}

/**
 * A profile document with unpopulated `files` field returned by a mongoose query.
 * @note This is a subdocument of the user document, and is not a full document.
 */
interface UnpopulatedProfileDoc
  extends HydratedSingleSubdocument<ProfileSchema> {}

/**
 * The profile document with populated `files` field returned by a mongoose query
 * followed by a `populate` call.
 * @note This is a subdocument of the user document, and is not a full document.
 */
type ProfileDoc = Replace<UnpopulatedProfileDoc, { files: FileDoc[] }>;

/** The base level populated profile object to be returned by the API. */
class Profile implements Replace<ProfileSchema, { files: File[] }> {
  constructor(
    public id: string,
    public files: File[],
    public bio?: string | null,
    public work?: string | null,
    public research?: string | null,
    public volunteering?: string | null
  ) {}

  /**
   * Converts a {@link ProfileDoc} to a {@link Profile} object.
   */
  static fromDoc(doc: ProfileDoc): Profile {
    return new Profile(
      doc._id.toString(),
      doc.files.map((file) => File.fromDoc(file)),
      doc.bio,
      doc.work,
      doc.research,
      doc.volunteering
    );
  }
}

type UserSchema = InferSchemaType<typeof userSchema>;

/**
 * An input object used when creating a user.
 * There is no id for the user or profile, and the files are an array of string ObjectIds.
 */
type InputUser = Replace<Omit<UserSchema, "entryDate">, { profile: InputProfile }>;

/** The user document with unpopulated `profile.files` field returned by a mongoose query. */
interface UnpopulatedUserDoc extends HydratedDocument<UserSchema> {}

/**
 * The user document with populated `profile.files` field return by a mongoose query
 * followed by a `populate` call
 * */
type UserDoc = Replace<UnpopulatedUserDoc, { profile: ProfileDoc }>;

/** The base level populated user object to be returned by the API */
class User implements Replace<UserSchema, { profile: Profile, accountId: string }> {
  constructor(
    public id: string,
    public first: string,
    public last: string,
    public profile: Profile,
    public accountId: string,
    public entryDate: Date
  ) {}

  /** Converts a {@link UserDoc} to a {@link User} object */
  static fromDoc(doc: UserDoc): User {
    return new User(
      doc._id.toString(),
      doc.first,
      doc.last,
      Profile.fromDoc(doc.profile),
      doc.accountId.toString(),
      doc.entryDate
    );
  }
}

type UserModelType = ModelWithOverrides<UnpopulatedUserDoc, UserDoc>;
const UserModel = mongoose.model<UserSchema, UserModelType>(
  "User",
  userSchema,
  "users"
);

export {
  ProfileSchema,
  UnpopulatedProfileDoc,
  ProfileDoc,
  Profile,
  UserSchema,
  UnpopulatedUserDoc,
  UserDoc,
  User,
  UserModel,
  UserModelType,
  InputUser,
  InputProfile,
};
