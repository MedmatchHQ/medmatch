import { FileService } from "@/modules/files/file.service";

const createMockFileService = () => {
  const fileService = {} as jest.Mocked<FileService>;
  fileService.getAllFiles = jest.fn();
  fileService.getFileById = jest.fn();
  fileService.createFile = jest.fn();
  fileService.deleteFile = jest.fn();
  return fileService;
};

export { createMockFileService };