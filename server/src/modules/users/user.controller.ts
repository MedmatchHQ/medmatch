import { UserService, InputUser } from "@/modules/users";
import { ControllerMethod } from "@/utils/errorHandler";
import { Request, Response } from "express";
import { FileService, File } from "@/modules/files";

class UserController {
  constructor(
    private userService: UserService = new UserService(),
    private fileService: FileService = new FileService()
  ) {}

  /**
   * Retrieves all users from the database with populated profile files.
   * @returns An array of all users
   * @codes 200
   */
  @ControllerMethod()
  async getAllUsers(req: Request, res: Response): Promise<void> {
    const users = await this.userService.getAllUsers();
    res.status(200).json({
      status: "success",
      data: users,
      message: "Users retrieved successfully",
    });
  }

  /**
   * Retrieves a specific user by their unique identifier with populated profile files.
   * @param {string} req.params.id The unique identifier of the user to retrieve
   * @returns The user object if found
   * @codes 200, 404
   * @throws A {@link UserNotFoundError} if the user with the specified id is not found
   */
  @ControllerMethod()
  async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);
    res.status(200).json({
      status: "success",
      data: user,
      message: `User with id ${user.id} retrieved successfully`,
    });
  }

  /**
   * Creates a new user with the provided user data and hashed password.
   * @param {InputUser} req.body The input user data used to create a new user
   * @returns The newly created user object with populated profile files
   * @codes 201, 409
   * @throws A {@link UserConflictError} if a user with the same email already exists
   */
  @ControllerMethod()
  async createUser(req: Request, res: Response): Promise<void> {
    const userData: InputUser = req.body;
    const user = await this.userService.createUser(userData);
    res.status(201).json({
      status: "success",
      data: user,
      message: `User with id ${user.id} created successfully`,
    });
  }

  /**
   * Updates an existing user with the provided data, hashing password if included.
   * @param {string} req.params.id The unique identifier of the user to update
   * @param {Partial<InputUser>} req.body Partial user data to update
   * @returns The updated user object with populated profile files
   * @codes 200, 404, 409
   * @throws A {@link UserNotFoundError} if the user with the specified id is not found
   * @throws A {@link UserConflictError} if the email update conflicts with an existing user
   */
  @ControllerMethod()
  async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userData = req.body;
    const user = await this.userService.updateUser(id, userData);
    res.status(200).json({
      status: "success",
      data: user,
      message: `User with id ${user.id} updated successfully`,
    });
  }

  /**
   * Deletes a user by their unique identifier.
   * @param {string} req.params.id The unique identifier of the user to delete
   * @returns The deleted user object with populated profile files
   * @codes 200, 404
   * @throws A {@link UserNotFoundError} if the user with the specified id is not found
   */
  @ControllerMethod()
  async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await this.userService.deleteUser(id);
    res.status(200).json({
      status: "success",
      data: user,
      message: `User with id ${user.id} deleted successfully`,
    });
  }

  /**
   * Creates a new file from uploaded data and adds it to the specified user's profile.
   * @param {string} req.params.id The unique identifier of the user
   * @param {Express.Multer.File} req.file The uploaded file data from multer middleware
   * @returns The updated user object with the new file added to their profile
   * @codes 200, 404, 409
   * @throws A {@link UserNotFoundError} if the user with the specified id is not found
   * @throws A {@link FileConflictError} if the file is already associated with the user
   */
  @ControllerMethod()
  async addFile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const fileData = req.file!;
    const file = await this.fileService.createFile({
      name: fileData.originalname,
      type: fileData.mimetype,
      data: fileData.buffer,
    } as File);
    const user = await this.userService.addFile(id, file.id);
    res.status(200).json({
      status: "success",
      data: user,
      message: `File ${file.name} with id ${file.id} successfully added to user with id ${user.id}`,
    });
  }

  /**
   * Removes a file from a user's profile and deletes it from the database.
   * @param {string} req.params.userId The unique identifier of the user
   * @param {string} req.params.fileId The unique identifier of the file to remove
   * @returns The updated user object with the file removed from their profile
   * @codes 200, 404
   * @throws A {@link UserNotFoundError} if the user with the specified id is not found
   * @throws A {@link FileNotFoundError} if the file is not associated with the user or doesn't exist
   */
  @ControllerMethod()
  async removeFile(req: Request, res: Response): Promise<void> {
    const { userId, fileId } = req.params;
    await this.fileService.deleteFile(fileId);
    const user = await this.userService.removeFile(userId, fileId);
    res.status(200).json({
      status: "success",
      data: user,
      message: "File removed successfully",
    });
  }
}

export { UserController };
