import { authenticate } from "@/utils/authentication";
import {
  validateFile,
  validateId,
  validation,
} from "@/utils/validationMiddleware";
import { Router } from "express";
import multer from "multer";
import { FileController } from "./file.controller";
import { FileValidator } from "./utils/file.validator";

const fileRouter = Router();
const fileController = new FileController();
const upload = multer();

fileRouter.use(authenticate);

fileRouter.get("/", fileController.getAllFiles);

fileRouter.get("/:id", validation(validateId()), fileController.getFileById);

fileRouter.post(
  "/",
  upload.single("file"),
  validation(validateFile(FileValidator)),
  fileController.createFile
);

fileRouter.delete("/:id", validation(validateId()), fileController.deleteFile);

export { fileRouter };
