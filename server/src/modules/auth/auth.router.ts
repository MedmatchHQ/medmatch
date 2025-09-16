import { AuthController } from "@/modules/auth/auth.controller";
import { authenticate } from "@/utils/authentication";
import {
  validateBody,
  validateId,
  validation,
} from "@/utils/validationMiddleware";
import { Router } from "express";
import { body, cookie, oneOf } from "express-validator";
import { CredentialsValidator } from "./utils/auth.validator";

const authRouter = Router();
const authController = new AuthController();

authRouter.post(
  "/login",
  validation(validateBody(CredentialsValidator)),
  authController.login
);

authRouter.post(
  "/signup",
  validation(validateBody(CredentialsValidator)),
  authController.signup
);

authRouter.post("/logout", authController.logout);

authRouter.post(
  "/token",
  validation(
    oneOf([
      cookie("refreshToken")
        .exists({ checkFalsy: true })
        .withMessage("Undefined or empty 'refreshToken' cookie"),
      body("refreshToken")
        .exists({ checkFalsy: true })
        .withMessage("Undefined or empty 'refreshToken' body"),
    ])
  ),
  authController.generateAccessToken
);

authRouter.get(
  "/:accountId/student-profile",
  authenticate,
  validation(validateId("accountId")),
  authController.getStudentProfile
);

authRouter.get(
  "/:accountId/professional-profile",
  authenticate,
  validation(validateId("accountId")),
  authController.getProfessionalProfile
);

export { authRouter };
