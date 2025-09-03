import { createMockRequest, createMockResponse } from "#/utils/express.mocks";
import { expectControllerSuccessResponse } from "#/utils/helpers";
import { FileController } from "@/modules/files/file.controller";
import { FileService } from "@/modules/files/file.service";
import { Request, Response } from "express";
import { createTestFile } from "../utils/file.helpers";
import { createMockFileService } from "../utils/file.mocks";

describe("File Controller", () => {
  let fileService: jest.Mocked<FileService>;
  let fileController: FileController;
  let req: jest.Mocked<Request>;
  let res: jest.Mocked<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    fileService = createMockFileService();
    fileController = new FileController(fileService);

    req = createMockRequest();
    res = createMockResponse();
  });

  describe("getAllFiles", () => {
    it("should return all files", async () => {
      const mockFiles = [await createTestFile(), await createTestFile()];
      fileService.getAllFiles.mockResolvedValue(mockFiles);

      await fileController.getAllFiles(req, res);

      expect(fileService.getAllFiles).toHaveBeenCalled();
      expectControllerSuccessResponse(res, { data: mockFiles });
    });
  });

  describe("getFileById", () => {
    it("should return a file by id", async () => {
      const mockFile = await createTestFile();
      fileService.getFileById.mockResolvedValue(mockFile);
      req.params.id = mockFile.id;

      await fileController.getFileById(req, res);

      expect(fileService.getFileById).toHaveBeenCalledWith(mockFile.id);
      expectControllerSuccessResponse(res, {
        message: expect.stringContaining(mockFile.id),
        data: mockFile,
      });
    });
  });

  describe("createFile", () => {
    it("should create a new file", async () => {
      const mockFile = await createTestFile();
      req.file = {
        originalname: mockFile.name,
        mimetype: mockFile.type,
        buffer: mockFile.data,
      } as unknown as Express.Multer.File;
      fileService.createFile.mockResolvedValue(mockFile);

      await fileController.createFile(req, res);

      expect(fileService.createFile).toHaveBeenCalledWith({
        name: req.file.originalname,
        type: req.file.mimetype,
        data: req.file.buffer,
      });
      expectControllerSuccessResponse(res, {
        status: 201,
        message: expect.stringContaining(mockFile.id),
        data: mockFile,
      });
    });
  });

  describe("deleteFile", () => {
    it("should delete a file by id", async () => {
      const mockFile = await createTestFile();
      req.params.id = mockFile.id;
      fileService.deleteFile.mockResolvedValue(mockFile);

      await fileController.deleteFile(req, res);

      expect(fileService.deleteFile).toHaveBeenCalledWith(mockFile.id);
      expectControllerSuccessResponse(res, {
        message: expect.stringContaining(mockFile.id),
        data: mockFile,
      });
    });
  });
});
