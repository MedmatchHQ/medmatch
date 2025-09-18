import { authenticate } from "@/utils/authentication";
import {
  validateBody,
  validateId,
  validatePartialBody,
  validation,
} from "@/utils/validationMiddleware";
import Router from "express";
import { body } from "express-validator";
import { JobPostingController } from "./job-posting.controller";
import { JobPostingValidator } from "./utils/job-posting.validator";

const jobPostingRouter = Router();
const jobPostingController = new JobPostingController();

// Apply authentication to all routes
jobPostingRouter.use(authenticate);

// GET /api/job-postings - Get all job postings
jobPostingRouter.get(
  "/",
  jobPostingController.getAllJobPostings
);

// GET /api/job-postings/company/:companyId - Get job postings by company
jobPostingRouter.get(
  "/company/:companyId",
  validation(validateId("companyId")),
  jobPostingController.getJobPostingsByCompany
);

// GET /api/job-postings/search/skills - Search job postings by skills
jobPostingRouter.get(
  "/search/skills",
  jobPostingController.searchJobPostingsBySkills
);

// GET /api/job-postings/search/location - Search job postings by location
jobPostingRouter.get(
  "/search/location",
  jobPostingController.searchJobPostingsByLocation
);

// GET /api/job-postings/:id - Get specific job posting
jobPostingRouter.get(
  "/:id",
  validation(validateId()),
  jobPostingController.getJobPostingById
);

// POST /api/job-postings - Create new job posting
jobPostingRouter.post(
  "/",
  validation(validateBody(JobPostingValidator)),
  jobPostingController.createJobPosting
);

// PATCH /api/job-postings/:id - Update job posting
jobPostingRouter.patch(
  "/:id",
  validation(validateId(), validatePartialBody(JobPostingValidator)),
  jobPostingController.updateJobPosting
);

// DELETE /api/job-postings/:id - Delete job posting
jobPostingRouter.delete(
  "/:id",
  validation(validateId()),
  jobPostingController.deleteJobPosting
);

// POST /api/job-postings/:id/apply - Increment applicant count
jobPostingRouter.post(
  "/:id/apply",
  validation(validateId()),
  jobPostingController.incrementApplicants
);

// PATCH /api/job-postings/:id/status - Update job status
jobPostingRouter.patch(
  "/:id/status",
  validation(
    validateId(),
    body("status")
      .isString()
      .notEmpty()
      .withMessage("Status is required")
  ),
  jobPostingController.updateJobStatus
);

export { jobPostingRouter };
