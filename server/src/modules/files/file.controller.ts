import { ControllerMethod } from "@/utils/errorHandler";
import { Request, Response } from "express";
import { File } from "./file.model";
import { FileService } from "./file.service";

class FileController {
  constructor(private fileService: FileService = new FileService()) {}

  /**
   * Retrieves all files from the database.
   * @returns An array of all files
   * @codes 200
   */
  @ControllerMethod()
  async getAllFiles(req: Request, res: Response): Promise<void> {
    const files = await this.fileService.getAllFiles();
    res.status(200).json({
      status: "success",
      message: "Files retrieved successfully",
      data: files,
    });
  }

  /**
   * Retrieves a specific file by its unique identifier.
   * @param {string} req.params.id The unique identifier of the file to retrieve
   * @returns The file object if found
   * @codes 200, 404
   * @throws A {@link FileNotFoundError} if the file with the specified id is not found
   */
  @ControllerMethod()
  async getFileById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const file = await this.fileService.getFileById(id);
    res.status(200).json({
      status: "success",
      message: `File with id ${id} retrieved successfully`,
      data: file,
    });
  }

  /**
   * Creates a new file from uploaded data using multer middleware.
   * @param {Express.Multer.File} req.file The uploaded file data from multer middleware
   * @returns The newly created file object
   * @codes 201
   * @note This function requires multer middleware to handle file uploads
   */
  @ControllerMethod()
  async createFile(req: Request, res: Response): Promise<void> {
    const { originalname, mimetype, buffer } = req.file!;
    const fileData = {
      name: originalname,
      type: mimetype,
      data: buffer,
    };
    const file = await this.fileService.createFile(fileData as File);
    res.status(201).json({
      status: "success",
      message: `File with id ${file.id} created successfully`,
      data: file,
    });
  }

  /**
   * Deletes a file by its unique identifier.
   * @param {string} req.params.id The unique identifier of the file to delete
   * @returns The deleted file object
   * @codes 200, 404
   * @throws A {@link FileNotFoundError} if the file with the specified id is not found
   */
  @ControllerMethod()
  async deleteFile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const file = await this.fileService.deleteFile(id);
    res.status(200).json({
      status: "success",
      message: `File with id ${id} deleted successfully`,
      data: file,
    });
  }
}

export { FileController };
