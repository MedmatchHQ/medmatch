import {
  UserNotFoundError,
  User,
  UserDoc,
  UnpopulatedUserDoc,
  UserModelType,
  InputUser,
  UserModel,
} from "@/modules/users";
import { ObjectId } from "mongodb";
import { FileConflictError, FileNotFoundError } from "@/modules/files";

class UserService {
  constructor(private userModel: UserModelType = UserModel) {}

  /**
   * Retrieves all users from the database with populated profile files.
   * @returns An array of all users
   * @throws No specific errors, but may throw database-related errors
   */
  async getAllUsers(): Promise<User[]> {
    const docs = await this.userModel
      .find<UserDoc>()
      .populate("profile.files")
      .exec();
    return docs.map((doc) => User.fromDoc(doc));
  }

  /**
   * Retrieves a user by their unique identifier with populated profile files.
   * @param userId The unique identifier of the user
   * @returns The user object if found
   * @throws A {@link UserNotFoundError} if the user with the specified id is not found
   */
  async getUserById(userId: string): Promise<User> {
    const doc = await this.userModel
      .findById<UserDoc>(userId)
      .populate("profile.files")
      .exec();
    if (!doc) {
      throw new UserNotFoundError(`User with id ${userId} not found`);
    }
    return User.fromDoc(doc);
  }

  /**
   * Retrieves a user by their associated account ID with populated profile files.
   * @param accountId The unique identifier of the account associated with the user
   * @returns The user object if found
   * @throws A {@link UserNotFoundError} if no user is associated with the specified account id
   */
  async getUserByAccount(accountId: string): Promise<User> {
    const doc = await this.userModel
      .findOne<UserDoc>({ accountId })
      .populate("profile.files")
      .exec();
    if (!doc) {
      throw new UserNotFoundError(
        `User with account id ${accountId} not found`
      );
    }
    return User.fromDoc(doc);
  }

  /**
   * Creates a new user with the provided user data and hashed password.
   * @param userData User data used to create a new user
   * @returns The newly created user object with populated profile files
   */
  async createUser(userData: InputUser): Promise<User> {
    const user = new this.userModel(userData);
    await user.save();
    const populated: UserDoc = await user.populate("profile.files");
    return User.fromDoc(populated);
  }

  /**
   * Updates an existing user with the provided data
   * @param userId The unique identifier of the user to update
   * @param userData Partial user data to update
   * @returns The updated user object with populated profile files
   * @throws A {@link UserNotFoundError} if the user with the specified id is not found
   */
  async updateUser(
    userId: string,
    userData: Partial<InputUser>
  ): Promise<User> {
    const doc = await this.userModel
      .findByIdAndUpdate<UserDoc>(userId, userData, { new: true })
      .populate("profile.files")
      .exec();
    if (!doc) {
      throw new UserNotFoundError(`User with id ${userId} not found`);
    }
    return User.fromDoc(doc);
  }

  /**
   * Deletes a user by their unique identifier.
   * @param userId The unique identifier of the user to delete
   * @returns The deleted user object with populated profile files
   * @throws A {@link UserNotFoundError} if the user with the specified id is not found
   */
  async deleteUser(userId: string): Promise<User> {
    const doc = await this.userModel
      .findByIdAndDelete<UserDoc>(userId)
      .populate("profile.files")
      .exec();
    if (!doc) {
      throw new UserNotFoundError(`User with id ${userId} not found`);
    }
    return User.fromDoc(doc);
  }

  /**
   * Adds a file reference to a user's profile files array.
   * @param userId The unique identifier of the user
   * @param fileId The unique identifier of the file to add
   * @returns The updated user object with populated profile files
   * @throws A {@link UserNotFoundError} if the user with the specified id is not found
   * @throws A {@link FileConflictError} if the file is already associated with the user
   */
  async addFile(userId: string, fileId: string): Promise<User> {
    const doc = await this.userModel
      .findById<UnpopulatedUserDoc>(userId)
      .exec();

    if (!doc) {
      throw new UserNotFoundError(`User with id ${userId} not found`);
    } else if (doc.profile.files.includes(new ObjectId(fileId))) {
      throw new FileConflictError(
        `File with id ${fileId} already exists for user with id ${userId}`
      );
    }

    doc.profile.files.push(new ObjectId(fileId));
    await doc.save();

    const populated: UserDoc = await doc.populate("profile.files");
    return User.fromDoc(populated);
  }

  /**
   * Removes a file reference from a user's profile files array.
   * @param userId The unique identifier of the user
   * @param fileId The unique identifier of the file to remove
   * @returns The updated user object with populated profile files
   * @throws A {@link UserNotFoundError} if the user with the specified id is not found
   * @throws A {@link FileNotFoundError} if the file is not associated with the user
   */
  async removeFile(userId: string, fileId: string): Promise<User> {
    const user = await this.userModel
      .findById<UnpopulatedUserDoc>(userId)
      .exec();

    if (!user) {
      throw new UserNotFoundError(`User with id ${userId} not found`);
    } else if (!user.profile.files.includes(new ObjectId(fileId))) {
      throw new FileNotFoundError(
        `File with id ${fileId} not found for user with id ${userId}`
      );
    }

    user.profile.files = user.profile.files.filter(
      (file) => file.toHexString() !== fileId
    );
    await user.save();

    const populated: UserDoc = await user.populate("profile.files");
    return User.fromDoc(populated);
  }
}

export { UserService };
