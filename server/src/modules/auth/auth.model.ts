import mongoose, { Schema, HydratedDocument, InferSchemaType } from "mongoose";

/** Mongoose schema definition for account */
const accountSchema = new Schema({
  // lowercase email to ensure case insensitive uniqueness
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  entryDate: { type: Date, default: () => Date.now() },
});

type AccountSchema = InferSchemaType<typeof accountSchema>;

/**
 * An input object used when creating an account.
 * The userId should be a string ObjectId.
 */
type CreateAccountInput = Omit<AccountSchema, "entryDate">;

/** The account document returned by a mongoose query. */
type AccountDoc = HydratedDocument<AccountSchema>;

/** The base level account object to be returned by the API */
class Account {
  constructor(
    public id: string,
    public email: string,
    public password: string,
    public entryDate: Date
  ) {}

  /** Converts an {@link AccountDoc} to an {@link Account} object */
  static fromDoc(doc: AccountDoc): Account {
    return new Account(
      doc._id.toString(),
      doc.email,
      doc.password,
      doc.entryDate
    );
  }
}

const AccountModel = mongoose.model<AccountSchema>(
  "Account",
  accountSchema,
  "accounts"
);

export { AccountSchema, AccountDoc, Account, AccountModel, CreateAccountInput };
