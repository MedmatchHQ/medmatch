import { getAuthenticatedAgent } from "#/utils/mockAuthentication";
import TestAgent from "supertest/lib/agent";
import { createTestUser, defaultUserData } from "../utils/user.helpers";
import { TestUserValidator } from "../utils/user.validators";
import { expectSuccessResponse } from "#/utils/helpers";
import { InputUser, User, UserModel } from "@/modules/users";
import { FileModel } from "@/modules/files";

describe("User Router Integration", () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = getAuthenticatedAgent();
  });

  describe("GET /", () => {
    it("should return an empty list when there are no users", async () => {
      const response = await agent.get("/api/users");

      await expectSuccessResponse(response, Object);
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
      console.log(
        "files",
        files.map((file) => file.name)
      );
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
  });
});
