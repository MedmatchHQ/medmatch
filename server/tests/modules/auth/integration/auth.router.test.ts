import {
  createTestUser,
  getUserData,
} from "#/modules/users/utils/user.helpers";
import request from "supertest";
import { app } from "@/server";
import {
  expectHttpErrorResponse,
  expectSuccessResponse,
} from "#/utils/helpers";
import { TestUserValidator } from "#/modules/users/utils/user.validators";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "@/types/errors";
import { User, UserModel } from "@/modules/users/user.model";
import { UserConflictError } from "@/modules/users/utils/user.errors";

function getAccessToken(user: { email: string; id: string }) {
  return jwt.sign(
    { email: user.email, id: user.id },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" }
  );
}

function getRefreshToken(user: { email: string; id: string }) {
  return jwt.sign(
    { email: user.email, id: user.id },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );
}

describe("Auth Router", () => {
  describe("POST /login", () => {
    it("should should log the user in and return user data with tokens", async () => {
      const userData = await getUserData();
      const user = await createTestUser(userData);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password });

      await expectSuccessResponse(response, TestUserValidator, {
        ...user,
        accessToken: getAccessToken(user),
        refreshToken: getRefreshToken(user),
      });
    });

    it("should set the refreshToken cookie on success", async () => {
      const userData = await getUserData();
      const user = await createTestUser(userData);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password });

      await expectSuccessResponse(response);
      const cookies = response.get("Set-Cookie");

      const refreshTokenCookie = cookies?.find((cookie: string) =>
        cookie.startsWith("refreshToken=")
      );
      expect(refreshTokenCookie).toMatch(/refreshToken=.*; Path=\/;/);

      const refreshTokenValue = refreshTokenCookie
        ?.split("refreshToken=")[1]
        ?.split(";")[0];
      expect(refreshTokenValue).toEqual(getRefreshToken(user));
    });

    it("should return Unauthorized for user not found", async () => {
      const userData = await getUserData();
      await createTestUser(userData);

      const response = await request(app).post("/api/auth/login").send({
        email: "incorrect-email@example.com",
        password: userData.password,
      });

      await expectHttpErrorResponse(response, {
        status: 401,
        errors: [new UnauthorizedError("Invalid email or password")],
      });
    });

    it("should return Unauthorized for incorrect password", async () => {
      const userData = await getUserData();
      await createTestUser(userData);

      const response = await request(app).post("/api/auth/login").send({
        email: userData.email,
        password: "wrong password",
      });

      await expectHttpErrorResponse(response, {
        status: 401,
        errors: [new UnauthorizedError("Invalid email or password")],
      });
    });
  });

  describe("POST /signup", () => {
    it("should create a new user", async () => {
      const userData = await getUserData();

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData);

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

    it("should return an error for duplicate email", async () => {
      const user = await createTestUser();
      const newData = await getUserData();
      const duplicateEmailData = {
        ...newData,
        email: user.email.toUpperCase(),
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(duplicateEmailData);

      await expectHttpErrorResponse(response, {
        status: 409,
        errors: [
          new UserConflictError(
            expect.stringContaining(user.email.toUpperCase())
          ),
        ],
      });
    });

    it("should hash the password", async () => {
      const userData = await getUserData();

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData);

      const user = await UserModel.findById(response.body.data.id);
      expect(user).toBeDefined();
      expect(user!.password).not.toBe(userData.password);
      expect(user!.password).toBeDefined();
    });
  });

  describe("POST /logout", () => {
    it("should remove the refreshToken cookie", async () => {
      const userData = await getUserData();
      await createTestUser(userData);

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password });

      const cookies = loginRes.get("Set-Cookie");
      const refreshTokenCookie = cookies?.find((cookie: string) =>
        cookie.startsWith("refreshToken=")
      );
      expect(refreshTokenCookie).toBeDefined();

      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", refreshTokenCookie!);

      await expectSuccessResponse(logoutRes);

      const logoutCookies = logoutRes.get("Set-Cookie");
      const clearedCookie = logoutCookies?.find((cookie: string) =>
        cookie.startsWith("refreshToken=")
      );
      expect(clearedCookie).toMatch(/refreshToken=;/);
      expect(clearedCookie).toMatch(/Expires=Thu, 01 Jan 1970 00:00:00 GMT/);
    });
  });

  describe("POST /token", () => {
    describe("refresh token in cookies", () => {
      it("should return an access token for valid refresh token", async () => {
        const user = await createTestUser();
        const refreshToken = getRefreshToken(user);

        const response = await request(app)
          .post("/api/auth/token")
          .set("Cookie", `refreshToken=${refreshToken}`);

        await expectSuccessResponse(response, undefined, {
          accessToken: getAccessToken(user),
          refreshToken: refreshToken,
        });
      });

      it("should return Unauthorized for an invalid refresh token", async () => {
        const response = await request(app)
          .post("/api/auth/token")
          .set("Cookie", `refreshToken=invalidtoken`);

        await expectHttpErrorResponse(response, {
          status: 401,
          errors: [new UnauthorizedError("Invalid refresh token")],
        });
      });
    });

    describe("refresh token in body", () => {
      it("should return an access token for valid refresh token", async () => {
        const user = await createTestUser();
        const refreshToken = getRefreshToken(user);

        const response = await request(app)
          .post("/api/auth/token")
          .send({ refreshToken });

        await expectSuccessResponse(response, undefined, {
          accessToken: getAccessToken(user),
          refreshToken: refreshToken,
        });
      });

      it("should return Unauthorized for an invalid refresh token", async () => {
        const response = await request(app)
          .post("/api/auth/token")
          .send({ refreshToken: "invalid token" });

        await expectHttpErrorResponse(response, {
          status: 401,
          errors: [new UnauthorizedError("Invalid refresh token")],
        });
      });
    });
  });
});
