import { expectValidationErrors } from "#/utils/validation";
import request from "supertest";
import { app } from "@/server";
import {
  createTestUser,
  getUserData,
} from "#/modules/users/utils/user.helpers";

describe("Auth Validation", () => {
  describe("POST /login", () => {
    type Credentials = { email: string; password: string };
    test.each<[string, Partial<Record<keyof Credentials, any>>]>([
      ["invalid email type", { email: 123 }],
      ["invalid email", { email: "not-an-email" }],
      ["empty email", { email: "" }],
      ["password type", { password: 12345 }],
      ["empty password", { password: "" }],
    ])("should return a validation error for %s", async (_, badCredentials) => {
      const user = await createTestUser();
      const credentials: Credentials = {
        email: user.email,
        password: user.password,
        ...badCredentials,
      };
      const response = await request(app)
        .post("/api/auth/login")
        .send(credentials);
      expectValidationErrors(response, Object.keys(badCredentials), "body");
    });
  });

  describe("POST /signup", () => {
    test.each([
      {
        name: "invalid email format",
        getData: async () => {
          const userData = await getUserData();
          userData.email = "invalid email";
          return userData;
        },
        expectedFields: ["email"],
      },
      {
        name: "incorrect data types in user",
        getData: async () => ({
          first: 1,
          last: 2,
          email: 3,
          password: 4,
          isEmployer: 5,
          profile: 6,
        }),
        expectedFields: [
          "first",
          "last",
          "email",
          "password",
          "isEmployer",
          "profile",
        ],
      },
      {
        name: "incorrect data types in profile",
        getData: async () => {
          const user = await getUserData();
          return {
            ...user,
            profile: {
              bio: 1,
              work: 2,
              research: 3,
              volunteering: 4,
            },
          };
        },
        expectedFields: ["bio", "work", "research", "volunteering"],
      },
      {
        name: "empty strings in user",
        getData: async () => ({
          first: "",
          last: "",
          email: "",
          password: "",
          isEmployer: true,
        }),
        expectedFields: ["first", "last", "email", "password"],
      },
    ])(
      "should return validation error for $name",
      async ({ getData, expectedFields }) => {
        const requestData = await getData();
        const response = await request(app)
          .post("/api/auth/signup")
          .send(requestData);
        expectValidationErrors(response, expectedFields);
      }
    );
  });

  describe("POST /token", () => {
    it("should return a validation error for missing refreshToken", async () => {
      const response = await request(app).post("/api/auth/token").send();
      expectValidationErrors(response, ["refreshToken"], "body");
    });

    it("should return a validation error for empty string refreshToken in body", async () => {
      const response = await request(app)
        .post("/api/auth/token")
        .send({ refreshToken: "" });
      expectValidationErrors(response, ["refreshToken"], "body");
    });

    it("should return a validation error for empty refreshToken in cookies", async () => {
      const response = await request(app)
        .post("/api/auth/token")
        .set("Cookie", ["refreshToken="])
        .send();
      expectValidationErrors(response, ["refreshToken"], "cookies");
    });
  });
});
