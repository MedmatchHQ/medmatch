import {
  createTestAccount,
  getAccountData,
} from "#/modules/auth/utils/account.helpers";
import request from "supertest";
import { app } from "@/server";
import {
  expectHttpErrorResponse,
  expectSuccessResponse,
} from "#/utils/helpers";
import { TestAccountValidator } from "#/modules/auth/utils/account.validators";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "@/types/errors";
import { Account, AccountModel } from "@/modules/auth/auth.model";
import { AccountConflictError } from "@/modules/auth/utils/auth.errors";
import { createTestStudentProfile } from "#/modules/student-profiles/utils/student-profile.helpers";
import { TestStudentProfileValidator } from "#/modules/student-profiles/utils/student-profile.validators";
import { createTestProfessionalProfile } from "#/modules/professional-profiles/utils/professional-profile.helpers";
import { TestProfessionalProfileValidator } from "#/modules/professional-profiles/utils/professional-profile.validators";
import { getAuthenticatedAgent } from "#/utils/mockAuthentication";
import TestAgent from "supertest/lib/agent";

function getAccessToken(account: { email: string; id: string }) {
  return jwt.sign(
    { email: account.email, id: account.id },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" }
  );
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
      const accountData = await getAccountData();
      const account = await createTestAccount(accountData);

      const response = await request(app)
        .post("/api/accounts/login")
        .send({ email: accountData.email, password: accountData.password });

      await expectSuccessResponse(response, TestAccountValidator, {
        ...account,
        accessToken: getAccessToken(account),
        refreshToken: getRefreshToken(account),
      });
    });

    it("should set the refreshToken cookie on success", async () => {
      const accountData = await getAccountData();
      const account = await createTestAccount(accountData);

      const response = await request(app)
        .post("/api/accounts/login")
        .send({ email: accountData.email, password: accountData.password });

      await expectSuccessResponse(response);
      const cookies = response.get("Set-Cookie");

      const refreshTokenCookie = cookies?.find((cookie: string) =>
        cookie.startsWith("refreshToken=")
      );
      expect(refreshTokenCookie).toMatch(/refreshToken=.*; Path=\/;/);

      const refreshTokenValue = refreshTokenCookie
        ?.split("refreshToken=")[1]
        ?.split(";")[0];
      expect(refreshTokenValue).toEqual(getRefreshToken(account));
    });

    it("should return Unauthorized for account not found", async () => {
      const accountData = await getAccountData();
      await createTestAccount(accountData);

      const response = await request(app).post("/api/accounts/login").send({
        email: "incorrect-email@example.com",
        password: accountData.password,
      });

      await expectHttpErrorResponse(response, {
        status: 401,
        errors: [new UnauthorizedError("Invalid email or password")],
      });
    });

    it("should return Unauthorized for incorrect password", async () => {
      const accountData = await getAccountData();
      await createTestAccount(accountData);

      const response = await request(app).post("/api/accounts/login").send({
        email: accountData.email,
        password: "wrong password",
      });

      await expectHttpErrorResponse(response, {
        status: 401,
        errors: [new UnauthorizedError("Invalid email or password")],
      });
    });
  });

  describe("POST /signup", () => {
    it("should create a new account", async () => {
      const accountData = await getAccountData();

      const response = await request(app)
        .post("/api/accounts/signup")
        .send(accountData);

      const account = await AccountModel.findById(response.body.data.id);
      expect(account).toBeDefined();
      await expectSuccessResponse(
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
      const newData = await getAccountData();
      const duplicateEmailData = {
        ...newData,
        email: account.email.toUpperCase(),
      };

      const response = await request(app)
        .post("/api/accounts/signup")
        .send(duplicateEmailData);

      await expectHttpErrorResponse(response, {
        status: 409,
        errors: [
          new AccountConflictError(
            expect.stringContaining(account.email.toUpperCase())
          ),
        ],
      });
    });

    it("should hash the password", async () => {
      const accountData = await getAccountData();

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
      const accountData = await getAccountData();
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
        const account = await createTestAccount();
        const refreshToken = getRefreshToken(account);

        const response = await request(app)
          .post("/api/accounts/token")
          .set("Cookie", `refreshToken=${refreshToken}`);

        await expectSuccessResponse(response, undefined, {
          accessToken: getAccessToken(account),
          refreshToken: refreshToken,
        });
      });

      it("should return Unauthorized for an invalid refresh token", async () => {
        const response = await request(app)
          .post("/api/accounts/token")
          .set("Cookie", `refreshToken=invalidtoken`);

        await expectHttpErrorResponse(response, {
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

        await expectSuccessResponse(response, undefined, {
          accessToken: getAccessToken(account),
          refreshToken: refreshToken,
        });
      });

      it("should return Unauthorized for an invalid refresh token", async () => {
        const response = await request(app)
          .post("/api/accounts/token")
          .send({ refreshToken: "invalid token" });

        await expectHttpErrorResponse(response, {
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

      await expectSuccessResponse(
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

      await expectSuccessResponse(
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
