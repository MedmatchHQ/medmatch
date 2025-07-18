import {
  expectHttpErrorResponse,
  expectSuccessResponse,
} from "#/utils/helpers";
import {
  expectEndpointToRequireAuth,
  getAuthenticatedAgent,
  HTTPMethod,
} from "#/utils/mockAuthentication";
import TestAgent from "supertest/lib/agent";
import {
  createTestFile,
  getFileData,
} from "#/modules/files/utils/file.helpers";
import { TestFileValidator } from "#/modules/files/utils/file.validators";
import { Types } from "mongoose";
import { FileCode } from "@/modules/files/utils/file.errors";
import { FileModel, File } from "@/modules/files/file.model";

describe("File Router", () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = getAuthenticatedAgent();
  });

  describe("endpoint authentication", () => {
    test.each<[HTTPMethod, string]>([
      ["get", "/api/files"],
      ["get", "/api/files/:id"],
      ["post", "/api/files"],
      ["delete", "/api/files/:id"],
    ])("`%s %s` should require authentication", async (method, endpoint) => {
      await expectEndpointToRequireAuth(method, endpoint);
    });
  });

  describe("GET /", () => {
    it("should return an empty list when there are no files", async () => {
      const response = await agent.get("/api/files");

      await expectSuccessResponse(response);
    });

    it("should return all files", async () => {
      const file = await createTestFile();

      const response = await agent.get("/api/files");

      await expectSuccessResponse(response, [TestFileValidator], [file]);
    });
  });

  describe("GET /:id", () => {
    it("should return a file by id", async () => {
      const file = await createTestFile();

      const response = await agent.get(`/api/files/${file.id}`);

      await expectSuccessResponse(response, TestFileValidator, file);
    });

    it("should return an error for file not found", async () => {
      await createTestFile();
      const badId = new Types.ObjectId();

      const response = await agent.get(`/api/files/${badId}`);

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: FileCode.FileNotFound,
          },
        ],
      });
    });
  });

  describe("POST /", () => {
    it("should create a new file", async () => {
      const fileData = await getFileData();

      const response = await agent
        .post("/api/files")
        .attach("file", fileData.data, {
          filename: fileData.name,
          contentType: fileData.type,
        });

      expect(response.body.data).toBeDefined();
      const file = await FileModel.findById(response.body.data.id);
      expect(file).toBeDefined();
      await expectSuccessResponse(
        response,
        TestFileValidator,
        File.fromDoc(file!),
        {
          status: 201,
        }
      );
    });
  });

  describe("DELETE /:id", () => {
    it("should delete an existing file", async () => {
      const file1 = await createTestFile();
      const file2 = await createTestFile();

      const response = await agent.delete(`/api/files/${file1.id}`);

      await expectSuccessResponse(response, TestFileValidator, file1);
      const files = await FileModel.find();
      expect(files.length).toBe(1);
      expect(files[0].id).toEqual(file2.id);
    });
  });
});
