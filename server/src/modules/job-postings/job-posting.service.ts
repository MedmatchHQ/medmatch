import { ProfessionalProfileService } from "@/modules/professional-profiles/professional-profile.service";
import { ProfessionalProfileNotFoundError } from "@/modules/professional-profiles/utils/professional-profile.errors";
import { Model } from "mongoose";
import {
  InputJobPosting,
  JobPosting,
  JobPostingDoc,
  JobPostingModel,
  JobPostingSchema,
  UnpopulatedJobPostingDoc,
} from "./job-posting.model";
import { JobPostingNotFoundError } from "./utils/job-posting.errors";

/**
 * Handles job posting-related business logic such as CRUD operations.
 */
class JobPostingService {
  constructor(
    private jobPostingModel: Model<JobPostingSchema> = JobPostingModel,
    private professionalProfileService: ProfessionalProfileService = new ProfessionalProfileService()
  ) {}

  /**
   * Validates that the company (professional profile) reference exists
   */
  private async validateCompanyExists(companyRef: string): Promise<void> {
    try {
      await this.professionalProfileService.getProfessionalProfileById(companyRef);
    } catch (error) {
      if (error instanceof ProfessionalProfileNotFoundError) {
        throw new ProfessionalProfileNotFoundError(
          `Company with id ${companyRef} not found`
        );
      }
      throw error;
    }
  }

  /**
   * Retrieves all job postings from the database with populated company references.
   * @returns An array of all job postings
   * @throws No specific errors, but may throw database-related errors
   */
  async getAllJobPostings(): Promise<JobPosting[]> {
    const docs = await this.jobPostingModel
      .find<JobPostingDoc>()
      .populate("companyRef", "name tag location")
      .exec();
    return docs.map((doc) => JobPosting.fromDoc(doc));
  }

  /**
   * Retrieves job postings by company (professional profile) ID with populated company references.
   * @param companyId The unique identifier of the company (professional profile)
   * @returns An array of job postings for the specified company
   * @throws A {@link ProfessionalProfileNotFoundError} if the company with the specified id does not exist
   */
  async getJobPostingsByCompany(companyId: string): Promise<JobPosting[]> {
    await this.validateCompanyExists(companyId);
    
    const docs = await this.jobPostingModel
      .find<JobPostingDoc>({ companyRef: companyId })
      .populate("companyRef", "name tag location")
      .exec();
    return docs.map((doc) => JobPosting.fromDoc(doc));
  }

  /**
   * Retrieves a job posting by its unique identifier with populated company reference.
   * @param jobPostingId The unique identifier of the job posting
   * @returns The job posting object if found
   * @throws A {@link JobPostingNotFoundError} if the job posting with the specified id is not found
   */
  async getJobPostingById(jobPostingId: string): Promise<JobPosting> {
    const doc = await this.jobPostingModel
      .findById<JobPostingDoc>(jobPostingId)
      .populate("companyRef", "name tag location")
      .exec();
    if (!doc) {
      throw new JobPostingNotFoundError(
        `Job posting with id ${jobPostingId} not found`
      );
    }
    return JobPosting.fromDoc(doc);
  }

  /**
   * Creates a new job posting with the provided data.
   * @param jobPostingData Job posting data used to create a new job posting
   * @returns The newly created job posting object with populated company reference
   * @throws A {@link ProfessionalProfileNotFoundError} if the company with the specified id does not exist
   */
  async createJobPosting(
    jobPostingData: InputJobPosting
  ): Promise<JobPosting> {
    await this.validateCompanyExists(jobPostingData.companyRef);

    const jobPosting = new this.jobPostingModel(jobPostingData);
    await jobPosting.save();
    await jobPosting.populate("companyRef", "name tag location");
    return JobPosting.fromDoc(jobPosting as JobPostingDoc);
  }

  /**
   * Updates an existing job posting with the provided data.
   * @param jobPostingId The unique identifier of the job posting to update
   * @param jobPostingData Partial job posting data to update
   * @returns The updated job posting object with populated company reference
   * @throws A {@link JobPostingNotFoundError} if the job posting with the specified id is not found
   * @throws A {@link ProfessionalProfileNotFoundError} if a new company reference is provided and does not exist
   */
  async updateJobPosting(
    jobPostingId: string,
    jobPostingData: Partial<InputJobPosting>
  ): Promise<JobPosting> {
    if (jobPostingData.companyRef) {
      await this.validateCompanyExists(jobPostingData.companyRef);
    }

    const doc = await this.jobPostingModel
      .findByIdAndUpdate<JobPostingDoc>(jobPostingId, jobPostingData, {
        new: true,
      })
      .populate("companyRef", "name tag location")
      .exec();
    if (!doc) {
      throw new JobPostingNotFoundError(
        `Job posting with id ${jobPostingId} not found`
      );
    }
    return JobPosting.fromDoc(doc);
  }

  /**
   * Deletes a job posting by its unique identifier.
   * @param jobPostingId The unique identifier of the job posting to delete
   * @returns The deleted job posting object with populated company reference
   * @throws A {@link JobPostingNotFoundError} if the job posting with the specified id is not found
   */
  async deleteJobPosting(jobPostingId: string): Promise<JobPosting> {
    const doc = await this.jobPostingModel
      .findByIdAndDelete<JobPostingDoc>(jobPostingId)
      .populate("companyRef", "name tag location")
      .exec();
    if (!doc) {
      throw new JobPostingNotFoundError(
        `Job posting with id ${jobPostingId} not found`
      );
    }
    return JobPosting.fromDoc(doc);
  }

  /**
   * Increments the number of applicants for a job posting.
   * @param jobPostingId The unique identifier of the job posting
   * @returns The updated job posting object with populated company reference
   * @throws A {@link JobPostingNotFoundError} if the job posting with the specified id is not found
   */
  async incrementApplicants(jobPostingId: string): Promise<JobPosting> {
    const doc = await this.jobPostingModel
      .findByIdAndUpdate<JobPostingDoc>(
        jobPostingId,
        { $inc: { numApplicants: 1 } },
        { new: true }
      )
      .populate("companyRef", "name tag location")
      .exec();

    if (!doc) {
      throw new JobPostingNotFoundError(
        `Job posting with id ${jobPostingId} not found`
      );
    }
    return JobPosting.fromDoc(doc);
  }

  /**
   * Updates the job status of a job posting.
   * @param jobPostingId The unique identifier of the job posting
   * @param status The new job status to set
   * @returns The updated job posting object with populated company reference
   * @throws A {@link JobPostingNotFoundError} if the job posting with the specified id is not found
   */
  async updateJobStatus(
    jobPostingId: string,
    status: string
  ): Promise<JobPosting> {
    const doc = await this.jobPostingModel
      .findByIdAndUpdate<JobPostingDoc>(
        jobPostingId,
        { jobStatus: status },
        { new: true }
      )
      .populate("companyRef", "name tag location")
      .exec();

    if (!doc) {
      throw new JobPostingNotFoundError(
        `Job posting with id ${jobPostingId} not found`
      );
    }
    return JobPosting.fromDoc(doc);
  }

  /**
   * Searches job postings by skills tags.
   * @param skillsTags Array of skills to search for
   * @returns An array of job postings that match any of the provided skills
   */
  async searchJobPostingsBySkills(skillsTags: string[]): Promise<JobPosting[]> {
    const docs = await this.jobPostingModel
      .find<JobPostingDoc>({
        skillsTags: { $in: skillsTags },
      })
      .populate("companyRef", "name tag location")
      .exec();
    return docs.map((doc) => JobPosting.fromDoc(doc));
  }

  /**
   * Searches job postings by location.
   * @param location Location to search for (case-insensitive partial match)
   * @returns An array of job postings that match the location
   */
  async searchJobPostingsByLocation(location: string): Promise<JobPosting[]> {
    const docs = await this.jobPostingModel
      .find<JobPostingDoc>({
        location: { $regex: location, $options: "i" },
      })
      .populate("companyRef", "name tag location")
      .exec();
    return docs.map((doc) => JobPosting.fromDoc(doc));
  }
}

export { JobPostingService };
