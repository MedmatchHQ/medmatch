import { getAuthenticatedAgent } from "#/utils/mockAuthentication";
import { SuccessBodyValidator } from "#/utils/response.validator";
import { expectMatch } from "#/utils/validation";
import TestAgent from "supertest/lib/agent";
import { createTestUser } from "../utils/user.helpers";
import { TestUserValidator } from "../utils/user.validators";
import { expectSuccessResponse } from "#/utils/helpers";

describe("User Router Integration", () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = getAuthenticatedAgent();
  });

  describe("GET /", () => {
    it("should return an empty list when there are no users", async () => {
      const response = await agent.get("/api/users");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expectMatch(
        response.body,
        SuccessBodyValidator.withArrayData(TestUserValidator)
      );
      expect(response.body.data.length).toBe(0);
    });

    it("should return all users", async () => {
      await createTestUser();

      const response = await agent.get("/api/users");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expectMatch(
        response.body,
        SuccessBodyValidator.withArrayData(TestUserValidator)
      );
      expect(response.body.data.length).toBe(1);
    });
  });

  describe("GET /:id", () => {
    it("should return a user by id", async () => {
      const user = await createTestUser();

      const response = await agent.get(`/api/users/${user.id}`);

      expectSuccessResponse(response, TestUserValidator, user);
    });
  });

  describe("POST /", () => {
    it("should create a new user", async () => {});
  });

  describe("PATCH /:id", () => {
    it("should update an existing user", async () => {});
  });

  describe("DELETE /:id", () => {
    it("should delete an existing user", async () => {});
  });

  describe("POST /:id/files", () => {
    it("should upload a file for a user", async () => {});
  });

  describe("DELETE /:userId/files/:fileId", () => {
    it("should delete a file for a user", async () => {});
  });
});
