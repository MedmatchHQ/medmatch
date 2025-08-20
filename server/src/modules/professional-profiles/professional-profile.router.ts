import Router from "express";
import { ProfessionalProfileController } from "./professional-profile.controller";
import { ProfessionalProfileValidator } from "./utils/professional-profile.validator";
import {
  validation,
  validateBody,
  validatePartialBody,
  validateId,
} from "@/utils/validationMiddleware";
import { authenticate } from "@/utils/authentication";

const professionalProfileRouter = Router();
const professionalProfileController = new ProfessionalProfileController();

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

export { professionalProfileRouter };
