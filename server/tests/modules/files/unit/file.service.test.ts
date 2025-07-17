import {
  createTestFile,
  getFileData,
} from "#/modules/files/utils/file.helpers";
import { expectMatch } from "#/utils/validation";
import { TestFileValidator } from "#/modules/files/utils/file.validators";
import { FileService } from "@/modules/files/file.service";
import { FileModel, File } from "@/modules/files/file.model";
import { FileNotFoundError } from "@/modules/files/utils/file.errors";
import { Types } from "mongoose";

describe("File Service", () => {
  let fileService: FileService;

  beforeEach(() => {
    fileService = new FileService(FileModel);
  });

  describe("getAllFiles", () => {
    it("should return an emtpy array when no files exist", async () => {
      const files = await fileService.getAllFiles();
      expect(files).toEqual([]);
    });

    it("should return all files", async () => {
      const file1 = await createTestFile();
      const file2 = await createTestFile();

      const files = await fileService.getAllFiles();
      expect(files).toHaveLength(2);
      expect(files).toContainEqual<File>(file1);
      expect(files).toContainEqual<File>(file2);
      files.forEach((f) => expect(f).toBeInstanceOf(File));
      files.forEach(async (f) => await expectMatch(TestFileValidator, f));
    });
  });

  describe("getFileById", () => {
    it("should return the correct file by id", async () => {
      const file = await createTestFile();
      await createTestFile();

      const foundFile = await fileService.getFileById(file.id);

      expect(foundFile).toEqual(file);
      expect(foundFile).toBeInstanceOf(File);
      await expectMatch(TestFileValidator, foundFile);
    });

    it("should throw FileNotFoundError when file does not exist", async () => {
      expect.assertions(1);
      await createTestFile();
      await expect(
        fileService.getFileById(new Types.ObjectId().toString())
      ).rejects.toThrow(FileNotFoundError);
    });
  });

  describe("createFile", () => {
    it("should add the file to the database", async () => {
      const fileData = getFileData();

      const createdFile = await fileService.createFile(fileData);

      const files = await FileModel.find();
      expect(files).toHaveLength(1);
      expect(createdFile).toBeInstanceOf(File);
      expect(createdFile.name).toBe(fileData.name);
      expect(createdFile.type).toBe(fileData.type);
      expect(createdFile.id).toBeDefined();
      await expectMatch(TestFileValidator, createdFile);
    });

    it("should return the created file", async () => {
      const fileData = getFileData();

      const createdFile = await fileService.createFile(fileData);
      expect(createdFile).toBeInstanceOf(File);
      expect(createdFile.name).toBe(fileData.name);
      expect(createdFile.type).toBe(fileData.type);
      expect(createdFile.id).toBeDefined();
      await expectMatch(TestFileValidator, createdFile);
    });
  });

  describe("deleteFile", () => {
    it("should delete the file by id", async () => {
      const file = await createTestFile();
      await createTestFile();

      await fileService.deleteFile(file.id);

      const files = await FileModel.find();
      expect(files).toHaveLength(1);
      expect(files[0].id).not.toBe(file.id);
    });

    it("should return the deleted file", async () => {
      const file = await createTestFile();
      await createTestFile();

      const deletedFile = await fileService.deleteFile(file.id);

      expect(deletedFile).toEqual(file);
      expect(deletedFile).toBeInstanceOf(File);
      await expectMatch(TestFileValidator, deletedFile);
    });

    it("should throw FileNotFoundError when file does not exist", async () => {
      expect.assertions(1);
      await createTestFile();
      await expect(
        fileService.deleteFile(new Types.ObjectId().toString())
      ).rejects.toThrow(FileNotFoundError);
    });
  });
});
