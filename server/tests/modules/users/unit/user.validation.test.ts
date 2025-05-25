import {
  expectIdValidationError,
  expectMatch,
  expectValidationErrors,
} from "#/utils/validation";
import { SuccessBodyValidator } from "#/utils/response.validator";
import {
  createTestUser,
  defaultUserData,
} from "#/modules/users/utils/user.helpers";
import { TestUserValidator } from "#/modules/users/utils/user.validators";
import TestAgent from "supertest/lib/agent";
import { getAuthenticatedAgent } from "#/utils/mockAuthentication";
import { Types } from "mongoose";

describe("User Validation", () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = getAuthenticatedAgent();
  });

  describe("GET /:id", () => {
    it("should return a validation error for invalid id", async () => {
      const response = await agent.get("/api/users/invalid-id");
      expectIdValidationError(response);
    });
  });

  describe("POST /", () => {
    it("should return a validation error for invalid email", async () => {
      const userData = await defaultUserData();
      userData.email = "invalid email";

      const response = await agent.post("/api/users").send(userData);

      expectValidationErrors(response, ["email"]);
    });

    it("should return a validation error for incorrect data types in user", async () => {
      const invalidData = {
        first: 1,
        last: 2,
        email: 3,
        password: 4,
        isEmployer: 5,
        profile: 6,
      };

      const response = await agent.post("/api/users").send(invalidData);

      expectValidationErrors(response, Object.keys(invalidData));
    });

    it("should return a validation error for incorrect data types in profile", async () => {
      const user: any = await defaultUserData();
      const { profile, ...invalidData } = user;
      invalidData.profile = {
        bio: 1,
        work: 2,
        research: 3,
        volunteering: 4,
      };

      const response = await agent.post("/api/users").send(invalidData);

      expectValidationErrors(response, Object.keys(invalidData.profile));
    });

    it("should return a validation error for empty strings in user", async () => {
      const invalidData = {
        first: "",
        last: "",
        email: "",
        password: "",
        isEmployer: true,
      };

      const response = await agent.post("/api/users").send(invalidData);

      expectValidationErrors(response, Object.keys(invalidData));
    });
  });

  describe("PATCH /:id", () => {
    it("should return a validation error for invalid id", async () => {
      const response = await agent.patch("/api/users/invalid-id");
      expectIdValidationError(response);
    });

    it("should return a validation error if a null profile field in included in the body", async () => {
      const user = await createTestUser();
      const response = await agent
        .patch(`/api/users/${user.id}`)
        .send({ profile: null });

      expectValidationErrors(response, ["profile"]);
    });

    it("should throw a validation error if there is an attempt to edit the files array", async () => {
      const user = await createTestUser();
      const response = await agent
        .patch(`/api/users/${user.id}`)
        .send({ profile: { files: [] } });

      expectValidationErrors(response, ["profile.files"]);
    });

    it("should return a validation error for incorrect data types in user", async () => {
      const user = await createTestUser();
      const invalidData = {
        first: 1,
        last: 2,
        email: 3,
        password: 4,
        isEmployer: 5,
        profile: 6,
      };

      const response = await agent
        .patch(`/api/users/${user.id}`)
        .send(invalidData);

      expectValidationErrors(response, Object.keys(invalidData));
    });

    it("should return a validation error for incorrect data types in profile", async () => {
      const user = await createTestUser();

      const invalidProfile = {
        bio: 1,
        work: 2,
        research: 3,
        volunteering: 4,
      };

      const response = await agent
        .patch(`/api/users/${user.id}`)
        .send({ profile: invalidProfile });

      expectValidationErrors(response, Object.keys(invalidProfile));
    });

    it("should return a validation error for empty strings in user", async () => {
      const user = await createTestUser();

      const invalidData = {
        first: "",
        last: "",
        email: "",
        password: "",
      };

      const response = await agent
        .patch(`/api/users/${user.id}`)
        .send(invalidData);

      expectValidationErrors(response, Object.keys(invalidData));
    });
  });

  describe("DELETE /:id", () => {
    it("should return a validation error for invalid id", async () => {
      const response = await agent.delete("/api/users/invalid-id");
      expectIdValidationError(response);
    });
  });

  describe("POST /:id/files", () => {
    it("should return a validation error for invalid id", async () => {
      const response = await agent.post("/api/users/invalid-id/files");
      expectIdValidationError(response);
    });

    it("should throw a validation error for invalid file", async () => {
      const user = await createTestUser();
      const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB

      const response = await agent
        .post(`/api/users/${user.id}/files`)
        .attach("file", largeFile, {
          filename: "",
          contentType: "text/plain",
        });

      expectValidationErrors(response, ["file"], "file");
    });
  });

  describe("DELETE /:userId/files/:fileId", () => {
    it("should return a validation error for invalid user id", async () => {
      const validId = new Types.ObjectId().toString();
      const response = await agent.delete(
        `/api/users/invalid-id/files/${validId}`
      );
      expectIdValidationError(response, "userId");
    });

    it("should return a validation error for invalid file id", async () => {
      const validId = new Types.ObjectId().toString();
      const response = await agent.delete(
        `/api/users/${validId}/files/invalid-id`
      );
      expectIdValidationError(response, "fileId");
    });
  });
});
