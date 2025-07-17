import {
  createTestUser,
  getUserData,
} from "#/modules/users/utils/user.helpers";
import { AuthService } from "@/modules/auth/auth.service";
import { UserModel } from "@/modules/users/user.model";
import { UserService } from "@/modules/users/user.service";
import { UserConflictError } from "@/modules/users/utils/user.errors";
import { UnauthorizedError } from "@/types/errors";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

describe("Auth Service", () => {
  let authService: AuthService;
  beforeAll(() => {
    const userService = new UserService(UserModel);
    authService = new AuthService(userService);
  });

  describe("login", () => {
    it("should return a user when valid credentials are provided", async () => {
      const userData = await getUserData();
      const user = await createTestUser(userData);

      const loggedInUser = await authService.login(
        userData.email,
        userData.password
      );

      expect(loggedInUser).toEqual(user);
    });

    it("should throw UnauthorizedError when user is not found", async () => {
      expect.assertions(1);
      await createTestUser();
      await expect(
        authService.login("wrongemail", "wrongpassword")
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when password is incorrect", async () => {
      expect.assertions(1);
      const user = await createTestUser();
      await expect(
        authService.login(user.email, "wrongpassword")
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("signup", () => {
    it("should create and return a new user when valid data is provided", async () => {
      const userData = await getUserData();

      const newUser = await authService.signup(userData);

      expect(newUser).toBeDefined();
      expect(newUser.email).toBe(userData.email);
      expect(newUser.first).toBe(userData.first);
      expect(newUser.last).toBe(userData.last);
    });

    it("should throw UserConflictError when user already exists", async () => {
      expect.assertions(1);
      const userData = await getUserData();
      await createTestUser({ email: userData.email });

      await expect(authService.signup(userData)).rejects.toThrow(
        UserConflictError
      );
    });

    it("should hash the password before saving", async () => {
      const userData = await getUserData();
      const newUser = await authService.signup(userData);

      expect(newUser.password).not.toBe(userData.password);
      expect(newUser.email).toBe(userData.email);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a refresh token with email and id payload", async () => {
      const user = await createTestUser();
      const token = await authService.generateRefreshToken(user.email, user.id);

      expect(token).toBeDefined();
      const decoded = jwt.decode(token) as { email: string; id: string };
      expect(decoded.email).toBe(user.email);
      expect(decoded.id).toBe(user.id);
    });

    it("should generate a refresh token with 7 day expiration", async () => {
      const user = await createTestUser();
      const token = await authService.generateRefreshToken(user.email, user.id);

      expect(token).toBeDefined();
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      expect(decoded).toHaveProperty("exp");

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const expirationDiff = decoded.exp! - nowInSeconds;

      // Allowing a small margin due to execution delay
      expect(expirationDiff).toBeGreaterThanOrEqual(sevenDaysInSeconds - 5);
      expect(expirationDiff).toBeLessThanOrEqual(sevenDaysInSeconds + 5);
    });
  });

  describe("generateAccessToken", () => {
    it("should generate an access token with email and id payload", async () => {
      const user = await createTestUser();
      const refreshToken = await jwt.sign(
        { email: user.email, id: user.id },
        process.env.REFRESH_TOKEN_SECRET!
      );

      const accessToken = await authService.generateAccessToken(refreshToken);

      expect(accessToken).toBeDefined();
      const decoded = jwt.decode(accessToken) as { email: string; id: string };
      expect(decoded.email).toBe(user.email);
      expect(decoded.id).toBe(user.id);
    });

    it("should generate an access token with 15 minute expiration", async () => {
      const user = await createTestUser();
      const refreshToken = await jwt.sign(
        { email: user.email, id: user.id },
        process.env.REFRESH_TOKEN_SECRET!
      );

      const accessToken = await authService.generateAccessToken(refreshToken);

      expect(accessToken).toBeDefined();
      const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
      expect(decoded).toHaveProperty("exp");

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const fifteenMinInSeconds = 15 * 60;
      const expirationDiff = decoded.exp! - nowInSeconds;

      // Allowing a small margin due to execution delay
      expect(expirationDiff).toBeGreaterThanOrEqual(fifteenMinInSeconds - 5);
      expect(expirationDiff).toBeLessThanOrEqual(fifteenMinInSeconds + 5);
    });

    test.each(["id", "email"])(
      "should throw an Unauthorized error for missing %s in payload",
      async (missingField) => {
        expect.assertions(1);
        const user = await createTestUser();
        const refreshToken = jwt.sign(
          { email: user.email, id: user.id, [missingField]: undefined },
          process.env.REFRESH_TOKEN_SECRET!
        );

        return expect(
          authService.generateAccessToken(refreshToken)
        ).rejects.toThrow(UnauthorizedError);
      }
    );

    it("should throw an Unauthorized error if there is no user with the provided id", async () => {
      expect.assertions(1);
      const user = await createTestUser();
      const refreshToken = await jwt.sign(
        { email: user.email, id: new Types.ObjectId().toString() },
        process.env.REFRESH_TOKEN_SECRET!
      );

      await expect(
        authService.generateAccessToken(refreshToken)
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw an Unauthorized error if the user email does not match the token payload", async () => {
      expect.assertions(1);
      const user = await createTestUser();
      const refreshToken = await jwt.sign(
        { email: "nottheemail@example.com", id: user.id },
        process.env.REFRESH_TOKEN_SECRET!
      );
      await expect(
        authService.generateAccessToken(refreshToken)
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
