import { Router } from "express";
import multer from "multer";
import { FileValidator, FileController } from "@/modules/files";
import {
  validateFile,
  validateId,
  validation,
} from "@/utils/validationMiddleware";
import { authenticate } from "@/utils/authentication";

const fileRouter = Router();
const fileController = new FileController();
const upload = multer();

fileRouter.use(authenticate);

fileRouter.get("/", fileController.getAllFiles);

fileRouter.get("/:id", validateId("id"), fileController.getFileById);

fileRouter.post(
  "/",
  upload.single("file"),
  validation(validateFile(FileValidator)),
  fileController.createFile
);

fileRouter.delete("/:id", validateId("id"), fileController.deleteFile);

export { fileRouter };
