import Router from "express";
import { StudentProfileController } from "./student-profile.controller";
import {
  StudentProfileValidator,
  ExperienceValidator,
} from "./utils/student-profile.validator";
import { FileValidator } from "@/modules/files/utils/file.validator";
import {
  validation,
  validateBody,
  validatePartialBody,
  validateId,
  validateFile,
} from "@/utils/validationMiddleware";
import multer from "multer";
import { body } from "express-validator";
import { authenticate } from "@/utils/authentication";

const studentProfileRouter = Router();
const studentProfileController = new StudentProfileController();
const upload = multer();

studentProfileRouter.use(authenticate);

studentProfileRouter.get("/", studentProfileController.getAllStudentProfiles);

studentProfileRouter.get(
  "/:id",
  validation(validateId()),
  studentProfileController.getStudentProfileById
);

studentProfileRouter.post(
  "/",
  validation(validateBody(StudentProfileValidator)),
  studentProfileController.createStudentProfile
);

studentProfileRouter.patch(
  "/:id",
  validation(
    body("experiences")
      .optional()
      .not()
      .isEmpty()
      .withMessage(
        "Experiences field cannot be null or undefined if provided."
      ),
    body("picture")
      .not()
      .exists()
      .withMessage(
        "Picture should not be updated with PATCH. Please use picture routes."
      ),
    body("resume")
      .not()
      .exists()
      .withMessage(
        "Resume should not be updated with PATCH. Please use resume routes."
      ),
    validateId(),
    validatePartialBody(StudentProfileValidator)
  ),
  studentProfileController.updateStudentProfile
);

studentProfileRouter.delete(
  "/:id",
  validation(validateId()),
  studentProfileController.deleteStudentProfile
);

// Picture routes
studentProfileRouter.post(
  "/:id/picture",
  validation(validateId()),
  upload.single("file"),
  validation(validateFile(FileValidator)),
  studentProfileController.setPicture
);

studentProfileRouter.delete(
  "/:id/picture",
  validation(validateId()),
  studentProfileController.removePicture
);

// Resume routes
studentProfileRouter.post(
  "/:id/resume",
  validation(validateId()),
  upload.single("file"),
  validation(validateFile(FileValidator)),
  studentProfileController.setResume
);

studentProfileRouter.delete(
  "/:id/resume",
  validation(validateId()),
  studentProfileController.removeResume
);

// Experience routes
studentProfileRouter.post(
  "/:id/experiences",
  validation(validateId(), validateBody(ExperienceValidator)),
  studentProfileController.addExperience
);

studentProfileRouter.delete(
  "/:id/experiences/:experienceId",
  validation(validateId("id"), validateId("experienceId")),
  studentProfileController.removeExperience
);

export { studentProfileRouter };
