import {
  InputUser,
  User,
  UserDoc,
  UserModel,
} from "@/modules/users";
import { createTestFile } from "#/modules/files/util/file.helpers";

async function defaultUserData(): Promise<InputUser> {
  const testFile = await createTestFile();
  return {
    first: `Test-${Date.now()}`,
    last: `User-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    password: "password123",
    isEmployer: false,
    profile: {
      bio: "Test bio",
      files: [testFile.id],
    },
    entryDate: new Date(),
  };
}

async function createTestUser(data?: Partial<InputUser>): Promise<User> {
  const defaultUser = await defaultUserData();

  const userData = {
    ...defaultUser,
    ...data,
  };

  const user = new UserModel(userData);
  await user.save();
  const populated: UserDoc = await user.populate("profile.files");
  return User.fromDoc(populated);
}

async function createUnpopulatedTestUser(
  data?: Partial<InputUser>
): Promise<InputUser & { id: string }> {
  const defaultUser = await defaultUserData();

  const userData = {
    ...defaultUser,
    ...data,
  };

  const user = new UserModel(userData);
  await user.save();
  return {
    ...userData,
    id: user._id.toString(),
  };
}

export { 
  defaultUserData,
  createTestUser,
  createUnpopulatedTestUser,
}