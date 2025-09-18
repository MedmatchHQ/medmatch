import { ControllerMethod } from "@/utils/errorHandler";
import { Request, Response } from "express";
import { InputJobPosting } from "./job-posting.model";
import { JobPostingService } from "./job-posting.service";

class JobPostingController {
  constructor(
    private jobPostingService: JobPostingService = new JobPostingService()
  ) {}

  /**
   * Retrieves all job postings from the database with populated company references.
   * @returns An array of all job postings
   * @codes 200
   */
  @ControllerMethod()
  async getAllJobPostings(req: Request, res: Response): Promise<void> {
    const jobPostings = await this.jobPostingService.getAllJobPostings();
    res.status(200).json({
      status: "success",
      data: jobPostings,
      message: "Job postings retrieved successfully",
    });
  }

  /**
   * Retrieves job postings by company (professional profile) ID.
   * @param {string} req.params.companyId The unique identifier of the company (professional profile)
   * @returns An array of job postings for the specified company
   * @codes 200, 404
   * @throws A {@link ProfessionalProfileNotFoundError} if the company with the specified id does not exist
   */
  @ControllerMethod()
  async getJobPostingsByCompany(req: Request, res: Response): Promise<void> {
    const { companyId } = req.params;
    const jobPostings = await this.jobPostingService.getJobPostingsByCompany(companyId);
    res.status(200).json({
      status: "success",
      data: jobPostings,
      message: `Job postings for company ${companyId} retrieved successfully`,
    });
  }

  /**
   * Retrieves a specific job posting by its unique identifier with populated company reference.
   * @param {string} req.params.id The unique identifier of the job posting to retrieve
   * @returns The job posting object if found
   * @codes 200, 404
   * @throws A {@link JobPostingNotFoundError} if the job posting with the specified id is not found
   */
  @ControllerMethod()
  async getJobPostingById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const jobPosting = await this.jobPostingService.getJobPostingById(id);
    res.status(200).json({
      status: "success",
      data: jobPosting,
      message: `Job posting with id ${jobPosting.id} retrieved successfully`,
    });
  }

  /**
   * Creates a new job posting with the provided data.
   * @param {InputJobPosting} req.body The input job posting data used to create a new job posting
   * @returns The newly created job posting object with populated company reference
   * @codes 201, 404
   * @throws A {@link ProfessionalProfileNotFoundError} if the company with the specified id does not exist
   */
  @ControllerMethod()
  async createJobPosting(req: Request, res: Response): Promise<void> {
    const jobPostingData: InputJobPosting = req.body;
    const jobPosting = await this.jobPostingService.createJobPosting(jobPostingData);
    res.status(201).json({
      status: "success",
      data: jobPosting,
      message: `Job posting with id ${jobPosting.id} created successfully`,
    });
  }

  /**
   * Updates an existing job posting with the provided data.
   * @param {string} req.params.id The unique identifier of the job posting to update
   * @param {Partial<InputJobPosting>} req.body Partial job posting data to update
   * @returns The updated job posting object with populated company reference
   * @codes 200, 404
   * @throws A {@link JobPostingNotFoundError} if the job posting with the specified id is not found
   * @throws A {@link ProfessionalProfileNotFoundError} if a new company reference is provided and does not exist
   */
  @ControllerMethod()
  async updateJobPosting(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const jobPostingData = req.body;
    const jobPosting = await this.jobPostingService.updateJobPosting(id, jobPostingData);
    res.status(200).json({
      status: "success",
      data: jobPosting,
      message: `Job posting with id ${jobPosting.id} updated successfully`,
    });
  }

  /**
   * Deletes a job posting by its unique identifier.
   * @param {string} req.params.id The unique identifier of the job posting to delete
   * @returns The deleted job posting object with populated company reference
   * @codes 200, 404
   * @throws A {@link JobPostingNotFoundError} if the job posting with the specified id is not found
   */
  @ControllerMethod()
  async deleteJobPosting(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const jobPosting = await this.jobPostingService.deleteJobPosting(id);
    res.status(200).json({
      status: "success",
      data: jobPosting,
      message: `Job posting with id ${jobPosting.id} deleted successfully`,
    });
  }

  /**
   * Increments the number of applicants for a job posting.
   * @param {string} req.params.id The unique identifier of the job posting
   * @returns The updated job posting object with populated company reference
   * @codes 200, 404
   * @throws A {@link JobPostingNotFoundError} if the job posting with the specified id is not found
   */
  @ControllerMethod()
  async incrementApplicants(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const jobPosting = await this.jobPostingService.incrementApplicants(id);
    res.status(200).json({
      status: "success",
      data: jobPosting,
      message: `Applicant count incremented for job posting with id ${jobPosting.id}`,
    });
  }

  /**
   * Updates the job status of a job posting.
   * @param {string} req.params.id The unique identifier of the job posting
   * @param {string} req.body.status The new job status to set
   * @returns The updated job posting object with populated company reference
   * @codes 200, 404
   * @throws A {@link JobPostingNotFoundError} if the job posting with the specified id is not found
   */
  @ControllerMethod()
  async updateJobStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;
    const jobPosting = await this.jobPostingService.updateJobStatus(id, status);
    res.status(200).json({
      status: "success",
      data: jobPosting,
      message: `Job status updated for job posting with id ${jobPosting.id}`,
    });
  }

  /**
   * Searches job postings by skills tags.
   * @param {string[]} req.query.skills Array of skills to search for (comma-separated)
   * @returns An array of job postings that match any of the provided skills
   * @codes 200
   */
  @ControllerMethod()
  async searchJobPostingsBySkills(req: Request, res: Response): Promise<void> {
    const skillsQuery = req.query.skills as string;
    const skillsTags = skillsQuery ? skillsQuery.split(',').map(skill => skill.trim()) : [];
    
    const jobPostings = await this.jobPostingService.searchJobPostingsBySkills(skillsTags);
    res.status(200).json({
      status: "success",
      data: jobPostings,
      message: `Job postings matching skills retrieved successfully`,
    });
  }

  /**
   * Searches job postings by location.
   * @param {string} req.query.location Location to search for
   * @returns An array of job postings that match the location
   * @codes 200
   */
  @ControllerMethod()
  async searchJobPostingsByLocation(req: Request, res: Response): Promise<void> {
    const { location } = req.query;
    
    if (!location || typeof location !== 'string') {
      res.status(400).json({
        status: "error",
        errors: [{
          type: "validation",
          loc: "query",
          field: "location",
          details: "Location query parameter is required",
        }],
      });
      return;
    }

    const jobPostings = await this.jobPostingService.searchJobPostingsByLocation(location);
    res.status(200).json({
      status: "success",
      data: jobPostings,
      message: `Job postings in location "${location}" retrieved successfully`,
    });
  }
}

export { JobPostingController };
