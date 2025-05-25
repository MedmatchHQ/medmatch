import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "@/server";
import { expectMatch } from "./validation";
import { HttpErrorBodyValidator } from "./response.validator";

function getAuthenticatedAgent() {
  const token = jwt.sign(
    {
      email: "lebron@james.com",
      id: "60d21b4667d0d8992e610c85",
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "1h" }
  );

  const agent = request.agent(app);
  agent.auth(token, { type: "bearer" });

  return agent;
}

async function itShouldAuthenticateClient(
  endpoint: string,
  method: "get" | "post" | "patch" | "put" | "delete"
) {
  const response = await request(app)[method](endpoint);
  expect(response.status).toBe(401);
  expect(response.headers["content-type"]).toBe(
    "application/json; charset=utf-8"
  );
  expectMatch(HttpErrorBodyValidator, response.body);
  expect(response.body.errors.length).toBeGreaterThanOrEqual(1);
  const [error] = response.body.errors;
  expect(error.type).toEqual("http");
  expect(error.code).toEqual("UNAUTHORIZED");
}

export {
  getAuthenticatedAgent,
  itShouldAuthenticateClient,
};
