import { InputUser, User, UserDoc, UserModel } from "@/modules/users";
import { createTestFile } from "#/modules/files/utils/file.helpers";
import bcrypt from "bcrypt";

async function getUserData(): Promise<InputUser> {
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

/**
 * @param data Optional data to override the default file data.
 * Defaults to {@link getUserData}.
 */
async function createTestUser(data?: Partial<InputUser>): Promise<User> {
  const defaultUser = await getUserData();
  const password = data?.password ?? defaultUser.password;

  const userData = {
    ...defaultUser,
    ...data,
    password: await bcrypt.hash(password, 10),
  };

  const user = new UserModel(userData);
  await user.save();
  const populated: UserDoc = await user.populate("profile.files");
  return User.fromDoc(populated);
}

/**
 * @param data Optional data to override the default user data.
 * Defaults to {@link getUserData}.
 */
async function createUnpopulatedTestUser(
  data?: Partial<InputUser>
): Promise<InputUser & { id: string }> {
  const defaultUser = await getUserData();

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

export { getUserData, createTestUser, createUnpopulatedTestUser };
