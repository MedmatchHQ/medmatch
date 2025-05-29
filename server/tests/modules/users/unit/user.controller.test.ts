import { FileService } from "@/modules/files/file.service";
import { createMockRequest, createMockResponse } from "#/utils/express.mocks";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import {
  createTestUser,
  defaultUserData,
} from "#/modules/users/utils/user.helpers";
import { createMockUserService } from "#/modules/users/utils/user.mocks";
import { UserService } from "@/modules/users/user.service";
import { UserController } from "@/modules/users/user.controller";
import { createMockFileService } from "#/modules/files/util/file.mocks";

describe("User Controller", () => {
  let userService: jest.Mocked<UserService>;
  let fileService: jest.Mocked<FileService>;
  let userController: UserController;
  let req: jest.Mocked<Request>;
  let res: jest.Mocked<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    userService = createMockUserService();
    fileService = createMockFileService();
    userController = new UserController(userService, fileService);

    req = createMockRequest();
    res = createMockResponse();
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const mockUsers = [await createTestUser(), await createTestUser()];
      userService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getAllUsers(req, res);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUsers,
        message: "Users retrieved successfully",
      });
    });
  });

  describe("getUserById", () => {
    it("should return a user by id", async () => {
      const mockUser = await createTestUser();
      userService.getUserById.mockResolvedValue(mockUser);
      req.params.id = mockUser.id.toString();

      await userController.getUserById(req, res);

      expect(userService.getUserById).toHaveBeenCalledWith(
        mockUser.id.toString()
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUser,
        message: `User with id ${mockUser.id} retrieved successfully`,
      });
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      req.body = await defaultUserData();
      const mockUser = { ...req.body, id: new ObjectId() };
      userService.createUser.mockResolvedValue(mockUser);

      await userController.createUser(req, res);

      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUser,
        message: `User with id ${mockUser.id} created successfully`,
      });
    });
  });

  describe("updateUser", () => {
    it("should update an existing user", async () => {
      const mockUser = await createTestUser();
      req.params.id = mockUser.id.toString();
      req.body = { first: "Updated Name" };
      const updatedUser = { ...mockUser, first: "Updated Name" };
      userService.updateUser.mockResolvedValue(updatedUser);

      await userController.updateUser(req, res);

      expect(userService.updateUser).toHaveBeenCalledWith(
        mockUser.id.toString(),
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: updatedUser,
        message: `User with id ${updatedUser.id} updated successfully`,
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user by id", async () => {
      const mockUser = await createTestUser();
      req.params.id = mockUser.id.toString();
      userService.deleteUser.mockResolvedValue(mockUser);

      await userController.deleteUser(req, res);

      expect(userService.deleteUser).toHaveBeenCalledWith(
        mockUser.id.toString()
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUser,
        message: `User with id ${mockUser.id} deleted successfully`,
      });
    });
  });

  describe("addFile", () => {
    it("should add a file to a user", async () => {
      const mockUser = await createTestUser();
      const mockFile = {
        id: new ObjectId().toString(),
        name: "test-file.jpg",
        type: "image/jpeg" as const,
        data: Buffer.from("test"),
      };
      req.params.id = mockUser.id.toString();
      req.file = {
        originalname: mockFile.name,
        mimetype: mockFile.type,
        buffer: mockFile.data,
      } as unknown as Express.Multer.File;
      fileService.createFile.mockResolvedValue(mockFile);
      const mockReturn = mockUser;
      mockReturn.profile.files = [...mockUser.profile.files, mockFile];
      userService.addFile.mockResolvedValue(mockReturn);

      await userController.addFile(req, res);

      expect(fileService.createFile).toHaveBeenCalledWith({
        name: req.file.originalname,
        type: req.file.mimetype,
        data: req.file.buffer,
      });
      expect(userService.addFile).toHaveBeenCalledWith(
        mockUser.id.toString(),
        mockFile.id.toString()
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockReturn,
        message: `File ${mockFile.name} with id ${mockFile.id} successfully added to user with id ${mockUser.id}`,
      });
    });
  });

  describe("removeFile", () => {
    it("should remove a file from a user", async () => {
      const mockUser = await createTestUser();
      const mockFile = mockUser.profile.files[0];
      req.params.userId = mockUser.id.toString();
      req.params.fileId = mockFile.id.toString();
      userService.removeFile.mockResolvedValue(mockUser);
      fileService.deleteFile.mockResolvedValue(mockFile);

      await userController.removeFile(req, res);

      expect(userService.removeFile).toHaveBeenCalledWith(
        mockUser.id.toString(),
        mockFile.id.toString()
      );
      expect(fileService.deleteFile).toHaveBeenCalledWith(
        mockFile.id.toString()
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUser,
        message: `File removed successfully`,
      });
    });
  });
});
