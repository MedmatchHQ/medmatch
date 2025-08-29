import { ModelWithOverrides, Replace } from "@/types/mongoose";
import mongoose, { Schema, HydratedDocument, InferSchemaType } from "mongoose";

/** Mongoose schema definition for professional profile */
const professionalProfileSchema = new Schema({
  name: { type: String, required: true },
  about: { type: String },
  website: { type: String },
  mission: { type: String },
  location: { type: String },
  tag: { type: String, required: true },
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  entryDate: { type: Date, default: () => Date.now() },
});

type ProfessionalProfileSchema = InferSchemaType<
  typeof professionalProfileSchema
>;

/**
 * An input object used when creating a professional profile.
 * There is no id, and the accountId is a string ObjectId.
 */
type InputProfessionalProfile = Replace<
  Omit<ProfessionalProfileSchema, "entryDate">,
  {
    accountId: string;
  }
>;

/**
 * The professional profile document returned by a mongoose query.
 */
type UnpopulatedProfessionalProfileDoc =
  HydratedDocument<ProfessionalProfileSchema>;

/**
 * The professional profile document (no population needed for this model)
 */
type ProfessionalProfileDoc = UnpopulatedProfessionalProfileDoc;

/** The base level professional profile object to be returned by the API. */
class ProfessionalProfile {
  constructor(
    public id: string,
    public name: string,
    public tag: string,
    public accountId: string,
    public entryDate: Date,
    public about?: string | null,
    public website?: string | null,
    public mission?: string | null,
    public location?: string | null
  ) {}

  /**
   * Converts a {@link ProfessionalProfileDoc} to a {@link ProfessionalProfile} object.
   */
  static fromDoc(doc: ProfessionalProfileDoc): ProfessionalProfile {
    return new ProfessionalProfile(
      doc._id.toString(),
      doc.name,
      doc.tag,
      doc.accountId.toString(),
      doc.entryDate,
      doc.about,
      doc.website,
      doc.mission,
      doc.location
    );
  }
}

const ProfessionalProfileModel = mongoose.model<ProfessionalProfileSchema>(
  "ProfessionalProfile",
  professionalProfileSchema,
  "professionalProfiles"
);

export {
  ProfessionalProfileSchema,
  UnpopulatedProfessionalProfileDoc,
  ProfessionalProfileDoc,
  ProfessionalProfile,
  ProfessionalProfileModel,
  InputProfessionalProfile,
};
