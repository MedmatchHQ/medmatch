import { Replace } from "@/types/mongoose";
import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";

/** Job status enum values */
export enum JobStatus {
  ACTIVELY_HIRING = "actively_hiring",
  CLOSED = "closed",
  REVIEWING = "reviewing",
  ON_HOLD = "on_hold",
}

/** Work type enum values */
export enum WorkType {
  REMOTE = "remote",
  IN_PERSON = "in_person",
  HYBRID = "hybrid",
}

/** Hours type enum values */
export enum HoursType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  SPECIFIC_HOURS = "specific_hours",
}

/** Pay range schema for structured salary information */
const payRangeSchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  currency: { type: String, required: true, default: "USD" },
  period: { type: String, enum: ["hourly", "monthly", "yearly"], required: true },
}, { _id: false });

/** Hours schema for flexible hour definitions */
const hoursSchema = new Schema({
  type: { type: String, enum: Object.values(HoursType), required: true },
  specificHours: { type: Number }, // Used when type is SPECIFIC_HOURS
}, { _id: false });

/** Mongoose schema definition for job posting */
const jobPostingSchema = new Schema({
  // Basic Information
  jobTitle: { type: String, required: true },
  companyRef: { type: Schema.Types.ObjectId, ref: "ProfessionalProfile", required: true },
  
  // Data section
  postDate: { type: Date, required: true, default: () => Date.now() },
  location: { type: String, required: true },
  numApplicants: { type: Number, required: true, default: 0 },
  numAccepted: { type: Number, required: true },
  jobStatus: { 
    type: String, 
    enum: Object.values(JobStatus), 
    required: true,
    default: JobStatus.ACTIVELY_HIRING 
  },
  workType: { type: String, enum: Object.values(WorkType), required: true },
  payRange: { type: payRangeSchema, required: true },
  hours: { type: hoursSchema, required: true },
  deadline: { type: Date, required: true },
  skillsTags: [{ type: String }],
  externalApplicationLink: { type: String },
  
  // Content sections
  about: { type: String, required: true },
  qualifications: { type: String, required: true },
  responsibilities: { type: String, required: true },
  
  // Metadata
  entryDate: { type: Date, default: () => Date.now() },
});

type JobPostingSchema = InferSchemaType<typeof jobPostingSchema>;

/**
 * An input object used when creating a job posting.
 * The companyRef should be a string ObjectId.
 */
type InputJobPosting = Replace<
  Omit<JobPostingSchema, "entryDate" | "numApplicants">,
  {
    companyRef: string;
  }
>;

/**
 * The job posting document returned by a mongoose query without population.
 */
type UnpopulatedJobPostingDoc = HydratedDocument<JobPostingSchema>;

/**
 * The job posting document with populated company reference.
 */
type JobPostingDoc = UnpopulatedJobPostingDoc & {
  companyRef: {
    _id: mongoose.Types.ObjectId;
    name: string;
    tag: string;
    location?: string;
  };
};

/** Pay range interface for type safety */
interface PayRange {
  min: number;
  max: number;
  currency: string;
  period: "hourly" | "monthly" | "yearly";
}

/** Hours interface for type safety */
interface Hours {
  type: HoursType;
  specificHours?: number;
}

/** The base level job posting object to be returned by the API. */
class JobPosting {
  constructor(
    public id: string,
    public jobTitle: string,
    public companyRef: string | { id: string; name: string; tag: string; location?: string },
    public postDate: Date,
    public location: string,
    public numApplicants: number,
    public numAccepted: number,
    public jobStatus: JobStatus,
    public workType: WorkType,
    public payRange: PayRange,
    public hours: Hours,
    public deadline: Date,
    public skillsTags: string[],
    public about: string,
    public qualifications: string,
    public responsibilities: string,
    public entryDate: Date,
    public externalApplicationLink?: string | null
  ) {}

  /**
   * Converts a {@link JobPostingDoc} to a {@link JobPosting} object.
   */
  static fromDoc(doc: JobPostingDoc): JobPosting {
    // Handle populated company reference
    const companyRef = doc.companyRef._id
      ? {
          id: doc.companyRef._id.toString(),
          name: doc.companyRef.name,
          tag: doc.companyRef.tag,
          location: doc.companyRef.location,
        }
      : doc.companyRef.toString();

    return new JobPosting(
      doc._id.toString(),
      doc.jobTitle,
      companyRef,
      doc.postDate,
      doc.location,
      doc.numApplicants,
      doc.numAccepted,
      doc.jobStatus as JobStatus,
      doc.workType as WorkType,
      doc.payRange,
      {
        type: doc.hours.type as HoursType,
        specificHours: doc.hours.specificHours || undefined,
      },
      doc.deadline,
      doc.skillsTags,
      doc.about,
      doc.qualifications,
      doc.responsibilities,
      doc.entryDate,
      doc.externalApplicationLink
    );
  }

  /**
   * Converts an {@link UnpopulatedJobPostingDoc} to a {@link JobPosting} object.
   */
  static fromUnpopulatedDoc(doc: UnpopulatedJobPostingDoc): JobPosting {
    return new JobPosting(
      doc._id.toString(),
      doc.jobTitle,
      doc.companyRef.toString(),
      doc.postDate,
      doc.location,
      doc.numApplicants,
      doc.numAccepted,
      doc.jobStatus as JobStatus,
      doc.workType as WorkType,
      doc.payRange,
      {
        type: doc.hours.type as HoursType,
        specificHours: doc.hours.specificHours || undefined,
      },
      doc.deadline,
      doc.skillsTags,
      doc.about,
      doc.qualifications,
      doc.responsibilities,
      doc.entryDate,
      doc.externalApplicationLink
    );
  }
}

const JobPostingModel = mongoose.model<JobPostingSchema>(
  "JobPosting",
  jobPostingSchema,
  "jobPostings"
);

export {
  Hours,
  InputJobPosting,
  JobPosting,
  JobPostingDoc,
  JobPostingModel,
  JobPostingSchema,
  PayRange,
  UnpopulatedJobPostingDoc,
};
