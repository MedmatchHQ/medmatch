import { getAuthenticatedAgent } from "#/utils/mockAuthentication";
import {
  expectIdValidationError,
  expectValidationErrors,
} from "#/utils/validation";
import TestAgent from "supertest/lib/agent";
import { getFileData } from "#/modules/files/utils/file.helpers";
import { File } from "@/modules/files/file.model";

describe("File Validation", () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = getAuthenticatedAgent();
  });

  describe("GET /:id", () => {
    it("should return a validation error for invalid id", async () => {
      const response = await agent.get("/api/files/invalid-id");
      expectIdValidationError(response);
    });
  });

  describe("POST /", () => {
    type FileData = Partial<Record<keyof Express.Multer.File, any>>;
    test.each<[string, FileData]>([
      ["invalid file type", { mimetype: "text/plain" }],
      ["data over 5 MB", { buffer: Buffer.alloc(6 * 1024 * 1024) }], // 6 MB
    ])("should return a validation error for %s", async (_, badFile) => {
      const {
        name: originalname,
        type: mimetype,
        data: buffer,
      } = getFileData();
      const testFile: FileData = { originalname, mimetype, buffer, ...badFile };

      const response = await agent
        .post("/api/files")
        .attach("file", testFile.buffer, {
          filename: testFile.originalname,
          contentType: testFile.mimetype,
        });
      expectValidationErrors(response, Object.keys(badFile), "file");
    });
  });

  describe("DELETE /:id", () => {
    it("should return a validation error for invalid id", async () => {
      const response = await agent.delete("/api/files/invalid-id");
      expectIdValidationError(response);
    });
  });
});
