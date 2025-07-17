import { expectMatch } from "#/utils/validation";
import { ObjectId } from "mongodb";
import {
  FileConflictError,
  FileNotFoundError,
} from "@/modules/files/utils/file.errors";
import {
  createTestUser,
  getUserData,
} from "#/modules/users/utils/user.helpers";
import { TestUserValidator } from "#/modules/users/utils/user.validators";
import { createTestFile } from "#/modules/files/utils/file.helpers";
import { UserService } from "@/modules/users/user.service";
import { UserModel } from "@/modules/users/user.model";
import {
  UserConflictError,
  UserNotFoundError,
} from "@/modules/users/utils/user.errors";

describe("User Service", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(UserModel);
  });

  describe("getAllUsers", () => {
    it("should return an empty array for an empty database", async () => {
      const users = await userService.getAllUsers();
      expect(users).toEqual([]);
    });

    it("should return all users in the database", async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      const users = await userService.getAllUsers();

      expect(users.length).toBe(2);
      expect(users.some((user) => user.id === user1.id)).toBe(true);
      expect(users.some((user) => user.id === user2.id)).toBe(true);
    });

    it("should return all users with populated user structure", async () => {
      const user = await createTestUser();
      const users = await userService.getAllUsers();

      expect(users.length).toBe(1);
      expect(users[0].id).toEqual(user.id);
      expect(users[0].profile.files[0].id).toEqual(user.profile.files[0].id);
      await expectMatch(TestUserValidator, users[0]);
    });
  });

  describe("getUserById", () => {
    it("should return the correct user", async () => {
      const user = await createTestUser();
      await createTestUser();

      const foundUser = await userService.getUserById(user.id.toString());

      expect(foundUser.id).toEqual(user.id);
    });

    it("should return a populated user", async () => {
      const user = await createTestUser();
      const foundUser = await userService.getUserById(user.id.toString());

      const originalFiles = user.profile.files;
      const foundFiles = foundUser.profile.files;
      expect(foundFiles.length).toBeGreaterThan(0);
      expect(foundFiles[0].id).toEqual(originalFiles[0].id);
      await expectMatch(TestUserValidator, foundUser);
    });

    it("should throw a UserNotFoundError if the user does not exist", async () => {
      expect.assertions(1);
      await createTestUser();
      await createTestUser();
      await expect(
        userService.getUserById(new ObjectId().toString())
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe("createUser", () => {
    it("should add a user to the database", async () => {
      const userData = await getUserData();
      await userService.createUser(userData);

      const users = await UserModel.find();
      expect(users.length).toBe(1);
    });

    it("should return the created user", async () => {
      const userData = await getUserData();
      const createdUser = await userService.createUser(userData);

      const users = await UserModel.find();
      expect(users[0].id).toEqual(createdUser.id);
      await expectMatch(TestUserValidator, createdUser);
    });

    it("should throw a UserConflictError if the email is already in use", async () => {
      expect.assertions(1);
      const userData = await getUserData();
      await userService.createUser(userData);

      await expect(userService.createUser(userData)).rejects.toThrow(
        UserConflictError
      );
    });

    it("should throw a UserConflictError for a case-insensitive email conflict", async () => {
      expect.assertions(1);
      const userData = await getUserData();
      await userService.createUser(userData);

      await expect(
        userService.createUser({
          ...userData,
          email: userData.email.toUpperCase(),
        })
      ).rejects.toThrow(UserConflictError);
    });
  });

  describe("updateUser", () => {
    it("should not change the number of users", async () => {
      const user = await createTestUser();

      await userService.updateUser(user.id.toString(), {
        first: "NewFirstName",
      });

      const users = await UserModel.find();
      expect(users.length).toBe(1);
    });

    it("should update an existing user", async () => {
      const user = await createTestUser();
      const newFirst = `${user.first}!`;

      await userService.updateUser(user.id.toString(), {
        first: newFirst,
      });

      const [updatedUser] = await UserModel.find();
      expect(updatedUser.first).not.toEqual(user.first);
      expect(updatedUser.first).toEqual(newFirst);
    });

    it("should return the updated user", async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const newFirst = `${user1.first}!`;

      const updatedUser = await userService.updateUser(user1.id.toString(), {
        first: newFirst,
      });

      expect(updatedUser.id).not.toEqual(user2.id);
      expect(updatedUser.id).toEqual(user1.id);
      expect(updatedUser.first).toEqual(newFirst);
      await expectMatch(TestUserValidator, updatedUser);
    });

    it("should throw a UserNotFoundError for a non-existent user", async () => {
      expect.assertions(1);
      await createTestUser();
      await createTestUser();
      await expect(
        userService.updateUser(new ObjectId().toString(), {
          first: "NewName",
        })
      ).rejects.toThrow(UserNotFoundError);
    });

    it("should throw a UserConflictError for an email conflict", async () => {
      expect.assertions(1);
      await createTestUser({
        email: "test@example.com",
      });
      const user2 = await createTestUser({
        email: "different@example.com",
      });
      await expect(
        userService.updateUser(user2.id.toString(), {
          email: "test@example.com",
        })
      ).rejects.toThrow(UserConflictError);
    });

    it("should throw a UserConflictError for a case-insensitive email conflict", async () => {
      expect.assertions(1);
      await createTestUser({
        email: "test@example.com",
      });
      const user2 = await createTestUser({
        email: "different@example.com",
      });
      await expect(
        userService.updateUser(user2.id.toString(), {
          email: "TEST@example.com",
        })
      ).rejects.toThrow(UserConflictError);
    });
  });

  describe("deleteUser", () => {
    it("should delete the user from the database", async () => {
      const user = await createTestUser();
      await createTestUser();

      await userService.deleteUser(user.id.toString());

      const users = await UserModel.find();
      expect(users.length).toBe(1);
      expect(users[0].id).not.toEqual(user.id);
    });

    it("should return the deleted user", async () => {
      const user = await createTestUser();
      await createTestUser();

      const deletedUser = await userService.deleteUser(user.id.toString());

      expect(deletedUser.id).toEqual(user.id);
      await expectMatch(TestUserValidator, deletedUser);
    });

    it("should throw a UserNotFoundError for a non-existent user", async () => {
      expect.assertions(1);
      await createTestUser();
      await createTestUser();
      await expect(
        userService.deleteUser(new ObjectId().toString())
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe("addFile", () => {
    it("should add a file to the user's profile", async () => {
      const user = await createTestUser();
      const file = await createTestFile();
      const files = user.profile.files;

      const updatedUser = await userService.addFile(
        user.id.toString(),
        file.id.toString()
      );
      const updatedFiles = updatedUser.profile.files;

      expect(updatedFiles.length).toBe(files.length + 1);
      expect(updatedFiles.some((f) => f.id === file.id)).toBe(true);
    });

    it("should return an updated user with the new file", async () => {
      const user = await createTestUser();
      const file = await createTestFile();

      const updatedUser = await userService.addFile(
        user.id.toString(),
        file.id.toString()
      );
      const updatedFiles = updatedUser.profile.files;

      expect(updatedUser.id).toEqual(user.id);
      expect(updatedFiles.some((f) => f.id === file.id)).toBe(true);
      await expectMatch(TestUserValidator, updatedUser);
    });

    it("should throw a UserNotFoundError if the user does not exist", async () => {
      expect.assertions(1);
      await createTestUser();
      await createTestUser();
      const file = await createTestFile();
      await expect(
        userService.addFile(new ObjectId().toString(), file.id.toString())
      ).rejects.toThrow(UserNotFoundError);
    });

    it("should throw a FileConflictError if the file already exists for the user", async () => {
      expect.assertions(1);
      const user = await createTestUser();
      const file = user.profile.files[0];
      await expect(
        userService.addFile(user.id.toString(), file.id.toString())
      ).rejects.toThrow(FileConflictError);
    });
  });

  describe("deleteFile", () => {
    it("should remove a file from the user's profile", async () => {
      const user = await createTestUser();
      const files = user.profile.files;
      const file = files[0];

      const updatedUser = await userService.removeFile(
        user.id.toString(),
        file.id.toString()
      );
      const updatedFiles = updatedUser.profile.files;

      expect(updatedFiles.length).toBe(files.length - 1);
      expect(updatedFiles.some((f) => f.id === file.id)).toBe(false);
    });

    it("should return an updated user without the deleted file", async () => {
      const user = await createTestUser();
      const files = user.profile.files;
      const file = files[0];

      const updatedUser = await userService.removeFile(
        user.id.toString(),
        file.id.toString()
      );
      const updatedFiles = updatedUser.profile.files;

      expect(updatedUser.id).toEqual(user.id);
      expect(updatedFiles.some((f) => f.id === file.id)).toBe(false);
      await expectMatch(TestUserValidator, updatedUser);
    });

    it("should throw a UserNotFoundError if the user does not exist", async () => {
      expect.assertions(1);
      await createTestUser();
      await createTestUser();
      const file = await createTestFile();
      await expect(
        userService.removeFile(new ObjectId().toString(), file.id.toString())
      ).rejects.toThrow(UserNotFoundError);
    });

    it("should throw a FileNotFoundError if the file does not exist", async () => {
      expect.assertions(1);
      const user = await createTestUser();
      await expect(
        userService.removeFile(user.id.toString(), new ObjectId().toString())
      ).rejects.toThrow(FileNotFoundError);
    });

    it("should throw a FileNotFoundError if the file does not exist for the user", async () => {
      expect.assertions(1);
      const user = await createTestUser();
      const file = await createTestFile();
      await expect(
        userService.removeFile(user.id.toString(), file.id.toString())
      ).rejects.toThrow(FileNotFoundError);
    });
  });
});
