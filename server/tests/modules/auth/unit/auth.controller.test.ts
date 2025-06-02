import { AuthService } from "@/modules/auth/auth.service";
import { AuthController } from "@/modules/auth/auth.controller";
import { createMockAuthService } from "../utils/auth.mocks";
import { createMockRequest, createMockResponse } from "#/utils/express.mocks";
import { Request, Response } from "express";
import {
  createTestUser,
  getUserData,
} from "#/modules/users/utils/user.helpers";
import { expectControllerSuccessResponse } from "#/utils/helpers";
import { Types } from "mongoose";

describe("Auth Controller", () => {
  let authService: jest.Mocked<AuthService>;
  let authController: AuthController;
  let req: jest.Mocked<Request>;
  let res: jest.Mocked<Response>;
  const accessToken = "access";
  const refreshToken = "refresh";
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

  beforeEach(() => {
    jest.clearAllMocks();

    authService = createMockAuthService();
    authService.generateAccessToken.mockResolvedValue(accessToken);
    authService.generateRefreshToken.mockResolvedValue(refreshToken);
    authController = new AuthController(authService);

    req = createMockRequest();
    res = createMockResponse();
  });

  describe("login", () => {
    it("should send success response with user and tokens", async () => {
      const user = await createTestUser();
      authService.login.mockResolvedValue(user);
      req.body = { email: user.email, password: user.password };

      jest
        .spyOn(authController, "addTokens")
        .mockResolvedValue([accessToken, refreshToken]);

      await authController.login(req, res);

      expectControllerSuccessResponse(res, {
        message: expect.stringContaining(user.email),
        data: {
          ...user,
          accessToken,
          refreshToken,
        },
      });
    });

    it("should set refreshToken cookie with correct options", async () => {
      const user = await createTestUser();
      authService.login.mockResolvedValue(user);
      req.body = { email: user.email, password: user.password };

      await authController.login(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: sevenDaysInMs,
        })
      );
    });
  });

  describe("signup", () => {
    it("should send success response with user and tokens", async () => {
      const userData = await getUserData();
      const user = await createTestUser(userData);
      authService.signup.mockResolvedValue(user);
      req.body = userData;

      await authController.signup(req, res);
      expectControllerSuccessResponse(res, {
        message: expect.stringContaining(user.email),
        status: 201,
        data: {
          ...user,
          accessToken,
          refreshToken,
        },
      });
    });

    it("should set refreshToken cookie with correct options", async () => {
      const userData = await getUserData();
      const user = await createTestUser(userData);
      authService.signup.mockResolvedValue(user);
      req.body = userData;

      await authController.signup(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: sevenDaysInMs,
        })
      );
    });
  });

  describe("logout", () => {
    it("should clear the refreshToken cookie", async () => {
      await authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "strict",
          path: "/",
        })
      );
    });

    it("should send success response", async () => {
      await authController.logout(req, res);

      expectControllerSuccessResponse(res, {
        data: null,
      });
    });
  });

  describe("generateAccessToken", () => {
    it("should generate access token from refresh token in cookies", async () => {
      req.cookies.refreshToken = refreshToken;

      await authController.generateAccessToken(req, res);

      expectControllerSuccessResponse(res, {
        data: { accessToken, refreshToken },
      });
    });

    it("should generate access token from refresh token in body", async () => {
      req.body.refreshToken = refreshToken;

      await authController.generateAccessToken(req, res);

      expectControllerSuccessResponse(res, {
        data: { accessToken, refreshToken },
      });
    });
  });

  describe("addTokens", () => {
    it("should generate tokens and set refreshToken cookie", async () => {
      const email = "test@example.com";
      const id = new Types.ObjectId().toString();

      await authController.addTokens(res, email, id);

      expect(authService.generateRefreshToken).toHaveBeenCalledWith(email, id);
      expect(authService.generateAccessToken).toHaveBeenCalledWith(
        refreshToken
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: "strict",
          maxAge: sevenDaysInMs,
          path: "/",
        })
      );
    });

    it("should return access and refresh tokens", async () => {
      const email = "test@example.com";
      const id = new Types.ObjectId().toString();

      const result = await authController.addTokens(res, email, id);

      expect(authService.generateRefreshToken).toHaveBeenCalledWith(email, id);
      expect(authService.generateAccessToken).toHaveBeenCalledWith(
        refreshToken
      );
      expect(result).toEqual([accessToken, refreshToken]);
    });
  });
});
