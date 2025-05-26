import {
  UserNotFoundError,
  UserConflictError,
  User,
  UserDoc,
  UnpopulatedUserDoc,
  UserModelType,
  InputUser,
} from "@/modules/users";
import { MongoError, ObjectId } from "mongodb";
import { FileConflictError, FileNotFoundError } from "@/modules/files";
import { MongooseCode } from "@/types/errors";
import bcrypt from "bcrypt";

class UserService {
  constructor(private userModel: UserModelType) {}

  async getAllUsers(): Promise<User[]> {
    const docs = await this.userModel
      .find<UserDoc>()
      .populate("profile.files")
      .exec();
    return docs.map((doc) => User.fromDoc(doc));
  }

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

  async getUserByEmail(email: string): Promise<User> {
    const doc = await this.userModel
      .findOne<UserDoc>({ email })
      .populate("profile.files")
      .exec();
      if (!doc) {
        throw new UserNotFoundError(`User with email ${email} not found`);
      }
      return User.fromDoc(doc);
  }

  async createUser(userData: InputUser): Promise<User> {
    try {
      const user = new this.userModel({
        ...userData,
        password: await bcrypt.hash(userData.password, 10),
      });
      await user.save();
      const populated: UserDoc = await user.populate("profile.files");
      return User.fromDoc(populated);
    } catch (error) {
      if (
        error instanceof MongoError &&
        error.code === MongooseCode.DuplicateKey
      ) {
        throw new UserConflictError(
          `User with email ${userData.email} already exists`
        );
      }
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<InputUser>): Promise<User> {
    try {
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      const doc = await this.userModel
        .findByIdAndUpdate<UserDoc>(userId, userData, { new: true })
        .populate("profile.files")
        .exec();
      if (!doc) {
        throw new UserNotFoundError(`User with id ${userId} not found`);
      }
      return User.fromDoc(doc);
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new UserConflictError(
          `User with email ${userData.email} already exists`
        );
      }
      throw error;
    }
  }

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
