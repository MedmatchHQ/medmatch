import {
  createTestAccount,
  getAccountData,
} from "#/modules/auth/utils/account.helpers";
import { TestAccountValidator } from "#/modules/auth/utils/account.validators";
import { createTestProfessionalProfile } from "#/modules/professional-profiles/utils/professional-profile.helpers";
import { TestProfessionalProfileValidator } from "#/modules/professional-profiles/utils/professional-profile.validators";
import { createTestStudentProfile } from "#/modules/student-profiles/utils/student-profile.helpers";
import { TestStudentProfileValidator } from "#/modules/student-profiles/utils/student-profile.validators";
import {
  expectHttpErrorResponse,
  expectSuccessResponse,
} from "#/utils/helpers";
import { getAuthenticatedAgent } from "#/utils/mockAuthentication";
import { Account, AccountModel } from "@/modules/auth/auth.model";
import { AccountConflictError } from "@/modules/auth/utils/auth.errors";
import { app } from "@/server";
import { UnauthorizedError } from "@/types/errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import request from "supertest";
import TestAgent from "supertest/lib/agent";

const SEVEN_DAYS_IN_SECONDS = 604800;
const FIFTEEN_MINUTES_IN_SECONDS = 900;

function expectValidToken(
  token: string,
  account: { email: string; id: string },
  type: "refresh" | "access"
) {
  const secret =
    type === "refresh"
      ? process.env.REFRESH_TOKEN_SECRET!
      : process.env.ACCESS_TOKEN_SECRET!;

  const expirationInSeconds =
    type === "refresh" ? SEVEN_DAYS_IN_SECONDS : FIFTEEN_MINUTES_IN_SECONDS;

  expect(token).toBeDefined();
  const decoded = jwt.verify(token, secret) as JwtPayload;
  expect(decoded).toMatchObject({
    email: account.email,
    id: account.id,
    exp: expect.any(Number),
    iat: expect.any(Number),
  });
  expect(decoded.exp! - decoded.iat!).toBeCloseTo(expirationInSeconds, -1);
}

function getRefreshToken(account: { email: string; id: string }) {
  return jwt.sign(
    { email: account.email, id: account.id },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );
}

describe("Auth Router", () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = getAuthenticatedAgent();
  });

  describe("POST /login", () => {
    it("should log the account in and return account data with tokens", async () => {
      const accountData = getAccountData();
      const account = await createTestAccount(accountData);

      const response = await request(app)
        .post("/api/accounts/login")
        .send({ email: accountData.email, password: accountData.password });

      expectSuccessResponse(response, TestAccountValidator, account);

      const { refreshToken, accessToken } = response.body.data;

      expectValidToken(refreshToken, account, "refresh");
      expectValidToken(accessToken, account, "access");
    });

    it("should set the refreshToken cookie on success", async () => {
      const accountData = getAccountData();
      const account = await createTestAccount(accountData);

      const response = await request(app)
        .post("/api/accounts/login")
        .send({ email: accountData.email, password: accountData.password });

      expectSuccessResponse(response);
      const cookies = response.get("Set-Cookie");

      const refreshTokenCookie = cookies?.find((cookie: string) =>
        cookie.startsWith("refreshToken=")
      );
      expect(refreshTokenCookie).toMatch(/refreshToken=.*; Path=\/;/);

      const refreshTokenValue = refreshTokenCookie
        ?.split("refreshToken=")[1]
        ?.split(";")[0];

      expect(refreshTokenValue).toBeDefined();
      expectValidToken(refreshTokenValue!, account, "refresh");
    });

    it("should return Unauthorized for account not found", async () => {
      const accountData = getAccountData();
      await createTestAccount(accountData);

      const response = await request(app).post("/api/accounts/login").send({
        email: "incorrect-email@example.com",
        password: accountData.password,
      });

      expectHttpErrorResponse(response, {
        status: 401,
        errors: [new UnauthorizedError("Invalid email or password")],
      });
    });

    it("should return Unauthorized for incorrect password", async () => {
      const accountData = getAccountData();
      await createTestAccount(accountData);

      const response = await request(app).post("/api/accounts/login").send({
        email: accountData.email,
        password: "wrong password",
      });

      expectHttpErrorResponse(response, {
        status: 401,
        errors: [new UnauthorizedError("Invalid email or password")],
      });
    });
  });

  describe("POST /signup", () => {
    it("should create a new account", async () => {
      const accountData = getAccountData();

      const response = await request(app)
        .post("/api/accounts/signup")
        .send(accountData);

      const account = await AccountModel.findById(response.body.data.id);
      expect(account).toBeDefined();
      expectSuccessResponse(
        response,
        TestAccountValidator,
        Account.fromDoc(account!),
        {
          status: 201,
        }
      );
    });

    it("should return an error for duplicate email", async () => {
      const account = await createTestAccount();
      const newData = getAccountData();
      const duplicateEmailData = {
        ...newData,
        email: account.email.toUpperCase(),
      };

      const response = await request(app)
        .post("/api/accounts/signup")
        .send(duplicateEmailData);

      expectHttpErrorResponse(response, {
        status: 409,
        errors: [
          new AccountConflictError(
            expect.stringContaining(account.email.toUpperCase())
          ),
        ],
      });
    });

    it("should hash the password", async () => {
      const accountData = getAccountData();

      const response = await request(app)
        .post("/api/accounts/signup")
        .send(accountData);

      const account = await AccountModel.findById(response.body.data.id);
      expect(account).toBeDefined();
      expect(account!.password).not.toEqual(accountData.password);
    });
  });

  describe("POST /logout", () => {
    it("should remove the refreshToken cookie", async () => {
      const accountData = getAccountData();
      await createTestAccount(accountData);

      const loginRes = await request(app)
        .post("/api/accounts/login")
        .send({ email: accountData.email, password: accountData.password });

      const cookies = loginRes.get("Set-Cookie");
      const refreshTokenCookie = cookies?.find((cookie: string) =>
        cookie.startsWith("refreshToken=")
      );
      expect(refreshTokenCookie).toBeDefined();

      const logoutRes = await request(app)
        .post("/api/accounts/logout")
        .set("Cookie", refreshTokenCookie!);

      expectSuccessResponse(logoutRes);

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
        const account = await createTestAccount();
        const refreshToken = getRefreshToken(account);

        const response = await request(app)
          .post("/api/accounts/token")
          .set("Cookie", `refreshToken=${refreshToken}`);

        expectSuccessResponse(response, undefined, {
          refreshToken: refreshToken,
        });
        expectValidToken(response.body.data.accessToken, account, "access");
      });

      it("should return Unauthorized for an invalid refresh token", async () => {
        const response = await request(app)
          .post("/api/accounts/token")
          .set("Cookie", `refreshToken=invalidtoken`);

        expectHttpErrorResponse(response, {
          status: 401,
          errors: [new UnauthorizedError("Invalid refresh token")],
        });
      });
    });

    describe("refresh token in body", () => {
      it("should return an access token for valid refresh token", async () => {
        const account = await createTestAccount();
        const refreshToken = getRefreshToken(account);

        const response = await request(app)
          .post("/api/accounts/token")
          .send({ refreshToken });

        expectSuccessResponse(response, undefined, {
          refreshToken: refreshToken,
        });
        expectValidToken(response.body.data.accessToken, account, "access");
      });

      it("should return Unauthorized for an invalid refresh token", async () => {
        const response = await request(app)
          .post("/api/accounts/token")
          .send({ refreshToken: "invalid token" });

        expectHttpErrorResponse(response, {
          status: 401,
          errors: [new UnauthorizedError("Invalid refresh token")],
        });
      });
    });
  });

  describe("GET /:accountId/student-profile", () => {
    it("should return the student profile for a valid account", async () => {
      const studentProfile = await createTestStudentProfile();

      const response = await agent.get(
        `/api/accounts/${studentProfile.accountId}/student-profile`
      );

      expectSuccessResponse(
        response,
        TestStudentProfileValidator,
        studentProfile
      );
    });

    it("should return 404 if student profile not found", async () => {
      const account = await createTestAccount();

      const response = await agent.get(
        `/api/accounts/${account.id}/student-profile`
      );

      expect(response.status).toBe(404);
    });

    it("should return 401 without authentication", async () => {
      const account = await createTestAccount();

      const response = await request(app).get(
        `/api/accounts/${account.id}/student-profile`
      );

      expect(response.status).toBe(401);
    });
  });

  describe("GET /:accountId/professional-profile", () => {
    it("should return the professional profile for a valid account", async () => {
      const professionalProfile = await createTestProfessionalProfile();

      const response = await agent.get(
        `/api/accounts/${professionalProfile.accountId}/professional-profile`
      );

      expectSuccessResponse(
        response,
        TestProfessionalProfileValidator,
        professionalProfile
      );
    });

    it("should return 404 if professional profile not found", async () => {
      const account = await createTestAccount();

      const response = await agent.get(
        `/api/accounts/${account.id}/professional-profile`
      );

      expect(response.status).toBe(404);
    });

    it("should return 401 without authentication", async () => {
      const account = await createTestAccount();

      const response = await request(app).get(
        `/api/accounts/${account.id}/professional-profile`
      );

      expect(response.status).toBe(401);
    });
  });
});
