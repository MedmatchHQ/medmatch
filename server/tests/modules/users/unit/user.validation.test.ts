import {
  expectIdValidationError,
  expectValidationErrors,
} from "#/utils/validation";
import {
  createTestUser,
  defaultUserData,
} from "#/modules/users/utils/user.helpers";
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
    test.each([
      {
        name: "invalid email format",
        getData: async () => {
          const userData = await defaultUserData();
          userData.email = "invalid email";
          return userData;
        },
        expectedFields: ["email"],
      },
      {
        name: "incorrect data types in user",
        getData: async () => ({
          first: 1,
          last: 2,
          email: 3,
          password: 4,
          isEmployer: 5,
          profile: 6,
        }),
        expectedFields: [
          "first",
          "last",
          "email",
          "password",
          "isEmployer",
          "profile",
        ],
      },
      {
        name: "incorrect data types in profile",
        getData: async () => {
          const user = await defaultUserData();
          return {
            ...user,
            profile: {
              bio: 1,
              work: 2,
              research: 3,
              volunteering: 4,
            },
          };
        },
        expectedFields: ["bio", "work", "research", "volunteering"],
      },
      {
        name: "empty strings in user",
        getData: async () => ({
          first: "",
          last: "",
          email: "",
          password: "",
          isEmployer: true,
        }),
        expectedFields: ["first", "last", "email", "password"],
      },
    ])(
      "should return validation error for $name",
      async ({ getData, expectedFields }) => {
        const requestData = await getData();
        const response = await agent.post("/api/users").send(requestData);
        expectValidationErrors(response, expectedFields);
      }
    );
  });

  describe("PATCH /:id", () => {
    it("should return a validation error for invalid id", async () => {
      const response = await agent.patch("/api/users/invalid-id");
      expectIdValidationError(response);
    });

    test.each([
      {
        name: "null profile field in body",
        getData: () => ({ profile: null }),
        expectedFields: ["profile"],
      },
      {
        name: "attempt to edit files array",
        getData: () => ({
          profile: { files: [] },
        }),
        expectedFields: ["profile.files"],
      },
      {
        name: "invalid email format",
        getData: () => ({
          email: "invalid email",
        }),
        expectedFields: ["email"],
      },
      {
        name: "incorrect data types in user",
        getData: () => ({
          first: 1,
          last: 2,
          email: 3,
          password: 4,
          isEmployer: 5,
        }),
        expectedFields: ["first", "last", "email", "password", "isEmployer"],
      },
      {
        name: "incorrect data types in profile",
        getData: () => ({
          profile: {
            bio: 1,
            work: 2,
            research: 3,
            volunteering: 4,
          },
        }),
        expectedFields: ["bio", "work", "research", "volunteering"],
      },
      {
        name: "empty strings in user",
        getData: () => ({
          first: "",
          last: "",
          email: "",
          password: "",
        }),
        expectedFields: ["first", "last", "email", "password"],
      },
    ])(
      "should return validation error for $name",
      async ({ getData, expectedFields }) => {
        const user = await createTestUser();
        const requestData = getData();
        const response = await agent
          .patch(`/api/users/${user.id}`)
          .send(requestData);
        expectValidationErrors(response, expectedFields);
      }
    );
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
