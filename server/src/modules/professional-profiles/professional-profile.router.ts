import { authenticate } from "@/utils/authentication";
import {
  validateBody,
  validateId,
  validatePartialBody,
  validation,
} from "@/utils/validationMiddleware";
import { Request, Response, NextFunction } from "express";
import Router from "express";
import { ProfessionalProfileController } from "./professional-profile.controller";
import { ProfessionalProfileValidator } from "./utils/professional-profile.validator";
import { JobPostingController } from "@/modules/job-postings/job-posting.controller";
import { JobPostingValidator } from "@/modules/job-postings/utils/job-posting.validator";

const professionalProfileRouter = Router();
const professionalProfileController = new ProfessionalProfileController();
const jobPostingController = new JobPostingController();

professionalProfileRouter.use(authenticate);

professionalProfileRouter.get(
  "/",
  professionalProfileController.getAllProfessionalProfiles
);

professionalProfileRouter.get(
  "/:id",
  validation(validateId()),
  professionalProfileController.getProfessionalProfileById
);

professionalProfileRouter.post(
  "/",
  validation(validateBody(ProfessionalProfileValidator)),
  professionalProfileController.createProfessionalProfile
);

professionalProfileRouter.patch(
  "/:id",
  validation(validateId(), validatePartialBody(ProfessionalProfileValidator)),
  professionalProfileController.updateProfessionalProfile
);

professionalProfileRouter.delete(
  "/:id",
  validation(validateId()),
  professionalProfileController.deleteProfessionalProfile
);

// Job posting routes attached to professional profiles
// GET /api/professional-profiles/:id/job-postings - Get job postings for a specific company
professionalProfileRouter.get(
  "/:id/job-postings",
  validation(validateId()),
  (req: Request, res: Response, next: NextFunction) => {
    // Transform the route parameter to match the controller expectation
    req.params.companyId = req.params.id;
    // The decorator wraps the method to accept 3 parameters, so we cast it
    (jobPostingController.getJobPostingsByCompany as any)(req, res, next);
  }
);

// POST /api/professional-profiles/:id/job-postings - Create job posting for a specific company
professionalProfileRouter.post(
  "/:id/job-postings",
  validation(validateId()),
  // Custom middleware to set companyRef before validation
  (req: Request, res: Response, next: NextFunction) => {
    req.body.companyRef = req.params.id;
    next();
  },
  validation(validateBody(JobPostingValidator)),
  (req: Request, res: Response, next: NextFunction) => {
    // The decorator wraps the method to accept 3 parameters, so we cast it
    (jobPostingController.createJobPosting as any)(req, res, next);
  }
);

export { professionalProfileRouter };
