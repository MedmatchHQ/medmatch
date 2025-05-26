import { UserService, InputUser } from "@/modules/users";
import { ControllerMethod } from "@/utils/errorHandler";
import { Request, Response } from "express";
import { FileService, File } from "@/modules/files";

class UserController {
  constructor(
    private userService: UserService,
    private fileService: FileService
  ) {}

  @ControllerMethod()
  async getAllUsers(req: Request, res: Response): Promise<void> {
    const users = await this.userService.getAllUsers();
    res.status(200).json({
      status: "success",
      data: users,
      message: "Users retrieved successfully",
    });
  }

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
