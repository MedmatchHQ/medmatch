import bcrypt from "bcrypt";
import {
  UserService,
  User,
  InputUser,
  UserNotFoundError,
  UserConflictError,
} from "@/modules/users";
import { UnauthorizedError } from "@/types/errors";
import jwt from "jsonwebtoken";

/**
 * Handles authentication-related business logic such as login, signup,
 * and token generation.
 */
class AuthService {
  constructor(private userService: UserService) {}

  // Note: All methods should throw an ambiguous UnauthorizedError for security purposes.

  /**
   * Verfies a user email exists and the password matches the hash.
   * @param email User email
   * @param password User password
   * @returns The user object if login is successful
   * @throws An {@link UnauthorizedError} if the user is not found or the password is incorrect
   */
  async login(email: string, password: string): Promise<User> {
    let user: User;
    try {
      user = await this.userService.getUserByEmail(email);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new UnauthorizedError("Invalid email or password");
      }
      throw error;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }
    return user;
  }

  /**
   * Creates a new user based on the provided user data.
   * @param userData Partial {@link InputUser} user data (no ids, unpopulated files) used to create a new user
   * @returns The newly created user object
   * @throws A {@link UserConflictError} if the user already exists
   * @note This is just a wrapper around {@link UserService.createUser}
   */
  async signup(userData: InputUser): Promise<User> {
    return this.userService.createUser(userData);
  }

  /**
   * Generates a refresh token with email and id payload. This function expects the email and id to be valid.
   * @param email User email
   * @param id User id
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
   * The refresh token must be valid, not expired, and associated with an existing user.
   * @param refreshToken The refresh token to verify
   * @returns An access token on success
   * @throws An {@link UnauthorizedError} if the refresh token is invalid or expired
   * @throws An {@link UnauthorizedError} if the refresh token payload does not contain `email` and `id`
   * @throws An {@link UnauthorizedError} if the user associated with the token does not exist
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

    const user = await this.userService.getUserById(id);
    if (!user) {
      // User associated with token should exist
      throw new UnauthorizedError("Invalid refresh token");
    }

    const accessToken = jwt.sign({ email, id }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "15m",
    });
    return accessToken;
  }
}

export { AuthService };
