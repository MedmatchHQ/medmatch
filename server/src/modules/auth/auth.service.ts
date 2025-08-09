import bcrypt from "bcrypt";
import {
  Account,
  AccountModel,
  CreateAccountInput,
  AccountConflictError,
  AccountSchema,
} from "@/modules/auth";
import { UnauthorizedError } from "@/types/errors";
import { MongoError } from "mongodb";
import { MongooseCode } from "@/types/errors";
import jwt from "jsonwebtoken";
import { Model } from "mongoose";
import {
  StudentProfile,
  StudentProfileModel,
  StudentProfileDoc,
} from "@/modules/users/student-profile.model";
import { StudentProfileNotFoundError } from "@/modules/users/utils/student-profile.errors";
import {
  ProfessionalProfile,
  ProfessionalProfileModel,
  ProfessionalProfileDoc,
} from "@/modules/professional-profiles/professional-profile.model";
import { ProfessionalProfileNotFoundError } from "@/modules/professional-profiles/utils/professional-profile.errors";

/**
 * Handles authentication-related business logic such as login, signup,
 * and token generation.
 */
class AuthService {
  // Note: All methods should throw an ambiguous UnauthorizedError for security purposes.

  constructor(private accountModel: Model<AccountSchema> = AccountModel) {}

  /**
   * Verifies an account email exists and the password matches the hash.
   * @param email Account email
   * @param password Account password
   * @returns The account object if login is successful
   * @throws An {@link UnauthorizedError} if the account is not found or the password is incorrect
   */
  async login(email: string, password: string): Promise<Account> {
    const accountDoc = await this.accountModel.findOne({ email });
    if (!accountDoc) {
      throw new UnauthorizedError("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, accountDoc.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return Account.fromDoc(accountDoc);
  }

  /**
   * Creates a new account based on the provided data.
   * @param data Signup data containing account information
   * @returns The newly created account object
   * @throws An {@link AccountConflictError} if an account with the email already exists
   */
  async signup(data: CreateAccountInput): Promise<Account> {
    const { email, password } = data;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const accountData: CreateAccountInput = {
        email,
        password: hashedPassword,
      };

      const accountDoc = new this.accountModel(accountData);
      await accountDoc.save();
      return Account.fromDoc(accountDoc);
    } catch (error) {
      if (
        error instanceof MongoError &&
        error.code === MongooseCode.DuplicateKey
      ) {
        throw new AccountConflictError(
          `Account with email ${email} already exists`
        );
      }
      throw error;
    }
  }

  /**
   * Generates a refresh token with email and id payload. This function expects the email and id to be valid.
   * @param email Account email
   * @param id Account id
   * @returns The generated refresh token
   * @throws No errors
   */
  async generateRefreshToken(email: string, id: string): Promise<string> {
    const refreshToken = await jwt.sign(
      { email, id },
      process.env.REFRESH_TOKEN_SECRET!,
      // This should be the same time frame as the cookie max age in auth.controller.ts
      { expiresIn: "7d" }
    );
    return refreshToken;
  }

  /**
   * Generates an access token with email and id payload, given a valid refresh token.
   * The refresh token must be valid, not expired, and associated with an existing account.
   * @param refreshToken The refresh token to verify
   * @returns An access token on success
   * @throws An {@link UnauthorizedError} if the refresh token is invalid or expired
   * @throws An {@link UnauthorizedError} if the refresh token payload does not contain `email` and `id`
   * @throws An {@link UnauthorizedError} if the account associated with the token does not exist
   */
  async generateAccessToken(refreshToken: string): Promise<string> {
    let decoded: any;

    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
        email: string;
        id: string;
      };
    } catch (error) {
      // Refresh token should be valid
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.id !== "string" ||
      typeof decoded.email !== "string"
    ) {
      // Token payload should be in the shape of { email: string; id: string }
      throw new UnauthorizedError("Invalid refresh token");
    }

    const { email, id } = decoded as { email: string; id: string };

    const accountDoc = await this.accountModel.findOne({ email });
    if (!accountDoc) {
      // Account associated with token should exist
      throw new UnauthorizedError("Invalid refresh token");
    }
    const account = Account.fromDoc(accountDoc);

    if (account.id !== id) {
      // Account ID should match the token payload
      throw new UnauthorizedError("Invalid refresh token");
    }

    const accessToken = jwt.sign(
      { email, id },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "15m",
      }
    );
    return accessToken;
  }

  /**
   * Retrieves a student profile by their associated account ID with populated files.
   * @param accountId The unique identifier of the account associated with the student profile
   * @returns The student profile object if found
   * @throws A {@link StudentProfileNotFoundError} if no student profile is associated with the specified account id
   */
  async getStudentProfile(accountId: string): Promise<StudentProfile> {
    const doc = await StudentProfileModel.findOne<StudentProfileDoc>({
      accountId,
    })
      .populate(["picture", "resume"])
      .exec();
    if (!doc) {
      throw new StudentProfileNotFoundError(
        `Student profile with account id ${accountId} not found`
      );
    }
    return StudentProfile.fromDoc(doc);
  }

  /**
   * Retrieves a professional profile by their associated account ID.
   * @param accountId The unique identifier of the account associated with the professional profile
   * @returns The professional profile object if found
   * @throws A {@link ProfessionalProfileNotFoundError} if no professional profile is associated with the specified account id
   */
  async getProfessionalProfile(
    accountId: string
  ): Promise<ProfessionalProfile> {
    const doc = await ProfessionalProfileModel.findOne<ProfessionalProfileDoc>({
      accountId,
    }).exec();
    if (!doc) {
      throw new ProfessionalProfileNotFoundError(
        `Professional profile with account id ${accountId} not found`
      );
    }
    return ProfessionalProfile.fromDoc(doc);
  }
}

export { AuthService };
