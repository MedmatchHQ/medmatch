import Router from "express";
import {
  UserController,
  UserValidator,
} from "@/modules/users";
import { FileValidator } from "@/modules/files";
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

const userRouter = Router();
const userController = new UserController();
const upload = multer();

userRouter.use(authenticate);

userRouter.get("/", userController.getAllUsers);

userRouter.get(
  "/:id",
  validation(validateId("id")),
  userController.getUserById
);

userRouter.post(
  "/",
  validation(validateBody(UserValidator)),
  userController.createUser
);

userRouter.patch(
  "/:id",
  validation(
    body("profile")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Profile field cannot be null or undefined if provided."),
    body("profile.files")
      .not()
      .exists()
      .withMessage(
        "Files array should not be updated with PATCH. Please use user file routes."
      ),
    validateId("id"),
    validatePartialBody(UserValidator)
  ),
  userController.updateUser
);

userRouter.delete(
  "/:id",
  validation(validateId("id")),
  userController.deleteUser
);

userRouter.post(
  "/:id/files",
  upload.single("file"),
  validation(validateId("id"), validateFile(FileValidator)),
  userController.addFile
);

userRouter.delete(
  "/:userId/files/:fileId",
  validation(validateId("userId"), validateId("fileId")),
  userController.removeFile
);

export { userRouter };
