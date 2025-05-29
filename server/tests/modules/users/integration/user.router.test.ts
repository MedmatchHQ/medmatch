import {
  expectEndpointToRequireAuth,
  getAuthenticatedAgent,
  HTTPMethod,
} from "#/utils/mockAuthentication";
import TestAgent from "supertest/lib/agent";
import {
  createTestUser,
  defaultUserData,
} from "#/modules/users/utils/user.helpers";
import { TestUserValidator } from "#/modules/users/utils/user.validators";
import {
  expectHttpErrorResponse,
  expectSuccessResponse,
} from "#/utils/helpers";
import { ObjectId } from "mongodb";
import { UserCode } from "@/modules/users/utils/user.errors";
import { InputUser, User, UserModel } from "@/modules/users/user.model";
import { FileModel } from "@/modules/files/file.model";
import { FileCode } from "@/modules/files/utils/file.errors";

describe("User Router", () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = getAuthenticatedAgent();
  });

  describe("endpoint authentication", () => {
    test.each<[HTTPMethod, string]>([
      ["get", "/api/users"],
      ["get", "/api/users/:id"],
      ["post", "/api/users"],
      ["patch", "/api/users/:id"],
      ["delete", "/api/users/:id"],
      ["post", "/api/users/:id/files"],
      ["delete", "/api/users/:userId/files/:fileId"],
    ])("`%s %s` should require authentication", async (method, endpoint) => {
      await expectEndpointToRequireAuth(method, endpoint);
    });
  });

  describe("GET /", () => {
    it("should return an empty list when there are no users", async () => {
      const response = await agent.get("/api/users");

      await expectSuccessResponse(response);
    });

    it("should return all users", async () => {
      const user = await createTestUser();

      const response = await agent.get("/api/users");

      await expectSuccessResponse(response, [TestUserValidator], [user]);
    });
  });

  describe("GET /:id", () => {
    it("should return a user by id", async () => {
      const user = await createTestUser();

      const response = await agent.get(`/api/users/${user.id}`);

      await expectSuccessResponse(response, TestUserValidator, user);
    });

    it("should return an error for user not found", async () => {
      await createTestUser();
      const badId = new ObjectId();

      const response = await agent.get(`/api/users/${badId}`);

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: UserCode.UserNotFound,
          },
        ],
      });
    });
  });

  describe("POST /", () => {
    it("should create a new user", async () => {
      const userData = await defaultUserData();

      const response = await agent.post("/api/users").send(userData);

      const user = await UserModel.findById(response.body.data.id);
      expect(user).toBeDefined();
      await expectSuccessResponse(
        response,
        TestUserValidator,
        User.fromDoc(user!),
        {
          status: 201,
        }
      );
    });

    it("should return an error for duplicate email", async () => {
      const user = await createTestUser();
      const newData = await defaultUserData();
      const duplicateEmailData = {
        ...newData,
        email: user.email.toUpperCase(),
      };

      const response = await agent.post("/api/users").send(duplicateEmailData);

      await expectHttpErrorResponse(response, {
        status: 409,
        errors: [
          {
            details: expect.stringContaining(user.email.toUpperCase()),
            code: UserCode.UserConflict,
          },
        ],
      });
    });

    it("should hash the password", async () => {
      const userData = await defaultUserData();

      const response = await agent.post("/api/users").send(userData);

      const user = await UserModel.findById(response.body.data.id);
      expect(user).toBeDefined();
      expect(user!.password).not.toBe(userData.password);
      expect(user!.password).toBeDefined();
    });
  });

  describe("PATCH /:id", () => {
    it("should update an existing user", async () => {
      const user = await createTestUser();
      const updateData: Partial<InputUser> = { first: "Updated Name" };

      const response = await agent
        .patch(`/api/users/${user.id}`)
        .send(updateData);

      await expectSuccessResponse(response, TestUserValidator, {
        ...user,
        ...updateData,
      });
      const users = await UserModel.find();
      expect(users.length).toBe(1);
    });

    it("should return an error for user not found", async () => {
      const badId = new ObjectId();
      const updateData: Partial<InputUser> = { first: "Updated Name" };

      const response = await agent
        .patch(`/api/users/${badId}`)
        .send(updateData);

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: UserCode.UserNotFound,
          },
        ],
      });
    });

    it("should return an error for a duplicate email", async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const updateData: Partial<InputUser> = {
        email: user2.email.toUpperCase(),
      };

      const response = await agent
        .patch(`/api/users/${user1.id}`)
        .send(updateData);

      await expectHttpErrorResponse(response, {
        status: 409,
        errors: [
          {
            details: expect.stringContaining(user2.email.toUpperCase()),
            code: UserCode.UserConflict,
          },
        ],
      });
    });

    it("should hash the password if provided", async () => {
      const user = await createTestUser();
      const updateData: Partial<InputUser> = { password: "newpassword" };

      await agent.patch(`/api/users/${user.id}`).send(updateData);

      const updatedUser = await UserModel.findById(user.id);
      expect(updatedUser).toBeDefined();
      expect(updatedUser!.password).not.toBe(user.password);
      expect(updatedUser!.password).not.toBe(updateData.password);
      expect(updatedUser!.password).toBeDefined();
    });
  });

  describe("DELETE /:id", () => {
    it("should delete an existing user", async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      const response = await agent.delete(`/api/users/${user1.id}`);

      await expectSuccessResponse(response, TestUserValidator, user1);
      const users = await UserModel.find();
      expect(users.length).toBe(1);
      expect(users[0].id).toBe(user2.id);
    });

    it("should return an error for user not found", async () => {
      await createTestUser();
      const badId = new ObjectId();

      const response = await agent.delete(`/api/users/${badId}`);

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: UserCode.UserNotFound,
          },
        ],
      });
    });
  });

  describe("POST /:id/files", () => {
    it("should upload a file for a user", async () => {
      const user = await createTestUser();
      const fileData = Buffer.alloc(1024 * 1024);

      const response = await agent
        .post(`/api/users/${user.id}/files`)
        .attach("file", fileData, {
          filename: "test_file.png",
          contentType: "image/png",
        });

      await expectSuccessResponse(response, TestUserValidator);

      const files = await FileModel.find();
      expect(files.length).toBe(2);

      const updatedUser = await UserModel.findById(user.id).populate(
        "profile.files"
      );
      expect(updatedUser).toBeDefined();

      const userFiles = updatedUser!.profile.files;
      expect(userFiles.length).toBe(2);
      expect(userFiles.some((file) => file.name === "test_file.png")).toBe(
        true
      );
    });

    it("should return an error for user not found", async () => {
      const badId = new ObjectId();
      const fileData = Buffer.alloc(1024 * 1024);

      const response = await agent
        .post(`/api/users/${badId}/files`)
        .attach("file", fileData, {
          filename: "test_file.png",
          contentType: "image/png",
        });

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: UserCode.UserNotFound,
          },
        ],
      });
    });
  });

  describe("DELETE /:userId/files/:fileId", () => {
    it("should delete a file for a user", async () => {
      const user = await createTestUser();
      const fileId = user.profile.files[0].id;

      const response = await agent.delete(
        `/api/users/${user.id}/files/${fileId}`
      );

      const expectedUser = user;
      expectedUser.profile.files = [];
      await expectSuccessResponse(response, TestUserValidator, expectedUser);

      const updatedUser = await UserModel.findById(user.id);
      expect(updatedUser).toBeDefined();
      const userFiles = updatedUser!.profile.files;
      expect(userFiles.length).toBe(0);
    });

    it("should return an error for user not found", async () => {
      const user = await createTestUser();
      const badId = new ObjectId();
      const fileId = user.profile.files[0].id;

      const response = await agent.delete(
        `/api/users/${badId}/files/${fileId}`
      );

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: UserCode.UserNotFound,
          },
        ],
      });
    });

    it("should return an error for file not found", async () => {
      const user = await createTestUser();
      const badId = new ObjectId();

      const response = await agent.delete(
        `/api/users/${user.id}/files/${badId}`
      );

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
});
