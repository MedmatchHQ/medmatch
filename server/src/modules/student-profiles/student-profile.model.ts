import { File, FileDoc } from "@/modules/files/file.model";
import { ModelWithOverrides, Replace } from "@/types/mongoose";
import mongoose, {
  HydratedDocument,
  HydratedSingleSubdocument,
  InferSchemaType,
  Schema,
} from "mongoose";

/** Mongoose schema definition for experience */
const experienceSchema = new Schema({
  jobTitle: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String },
});

/** Mongoose schema definition for student profile */
const studentProfileSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  about: { type: String },
  picture: { type: Schema.Types.ObjectId, ref: "File" },
  resume: { type: Schema.Types.ObjectId, ref: "File" },
  experiences: { type: [experienceSchema], default: [] },
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  entryDate: { type: Date, default: () => Date.now() },
});

studentProfileSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

type ExperienceSchema = InferSchemaType<typeof experienceSchema>;
type StudentProfileSchema = InferSchemaType<typeof studentProfileSchema>;

/**
 * An input object used when creating an experience.
 */
type InputExperience = ExperienceSchema;

/**
 * An input object used when creating a student profile.
 * There is no id, and the file references are string ObjectIds.
 */
type InputStudentProfile = Replace<
  Omit<StudentProfileSchema, "entryDate">,
  {
    picture?: string;
    resume?: string;
    experiences: InputExperience[];
    accountId: string;
  }
>;

/**
 * An experience document returned by a mongoose query.
 * @note This is a subdocument of the student profile document, and is not a full document.
 */
type UnpopulatedExperienceDoc = HydratedSingleSubdocument<ExperienceSchema>;

/**
 * The student profile document with unpopulated file fields returned by a mongoose query.
 */
type UnpopulatedStudentProfileDoc = HydratedDocument<StudentProfileSchema>;

/**
 * The student profile document with populated file fields returned by a mongoose query
 * followed by a `populate` call.
 */
type StudentProfileDoc = Replace<
  UnpopulatedStudentProfileDoc,
  {
    picture?: FileDoc;
    resume?: FileDoc;
    fullName: string;
  }
>;

/** The base level populated experience object to be returned by the API. */
class Experience {
  constructor(
    public id: string,
    public jobTitle: string,
    public startDate: Date,
    public endDate?: Date | null,
    public description?: string | null
  ) {}

  /**
   * Converts an {@link UnpopulatedExperienceDoc} to an {@link Experience} object.
   */
  static fromDoc(doc: UnpopulatedExperienceDoc): Experience {
    return new Experience(
      doc._id.toString(),
      doc.jobTitle,
      doc.startDate,
      doc.endDate,
      doc.description
    );
  }
}

/** The base level populated student profile object to be returned by the API. */
class StudentProfile {
  constructor(
    public id: string,
    public firstName: string,
    public lastName: string,
    public fullName: string,
    public accountId: string,
    public entryDate: Date,
    public about?: string | null,
    public picture?: File | null,
    public resume?: File | null,
    public experiences: Experience[] = []
  ) {}

  /**
   * Converts a {@link StudentProfileDoc} to a {@link StudentProfile} object.
   */
  static fromDoc(doc: StudentProfileDoc): StudentProfile {
    return new StudentProfile(
      doc._id.toString(),
      doc.firstName,
      doc.lastName,
      doc.fullName,
      doc.accountId.toString(),
      doc.entryDate,
      doc.about,
      doc.picture ? File.fromDoc(doc.picture) : null,
      doc.resume ? File.fromDoc(doc.resume) : null,
      doc.experiences.map((exp) => Experience.fromDoc(exp))
    );
  }
}

type StudentProfileModelType = ModelWithOverrides<
  UnpopulatedStudentProfileDoc,
  StudentProfileDoc
>;

const StudentProfileModel = mongoose.model<
  StudentProfileSchema,
  StudentProfileModelType
>("StudentProfile", studentProfileSchema, "studentProfiles");

export {
  Experience,
  ExperienceSchema,
  InputExperience,
  InputStudentProfile,
  StudentProfile,
  StudentProfileDoc,
  StudentProfileModel,
  StudentProfileModelType,
  StudentProfileSchema,
  UnpopulatedExperienceDoc,
  UnpopulatedStudentProfileDoc
};

