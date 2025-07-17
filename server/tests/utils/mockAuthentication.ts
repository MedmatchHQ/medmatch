import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "@/server";
import { expectMatch } from "./validation";
import { HttpErrorBodyValidator } from "./response.validator";
import { HTTPMethod } from "#/types/HttpMethod";

/**
 * Creates an agent that passes auth middleware checks.
 * Sends a bearer JWT token in the Authorization header.
 */
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

/**
 * Tests for a 401 Unauthorized response on a request from an unauthenticated client.
 * @param endpoint The endpoint to test.
 * @param method The HTTP method to use for the request.
 */
async function expectEndpointToRequireAuth(
  method: HTTPMethod,
  endpoint: string
) {
  const response = await request(app)[method](endpoint);
  expect(response.status).toBe(401);
  expect(response.headers["content-type"]).toBe(
    "application/json; charset=utf-8"
  );
  await expectMatch(HttpErrorBodyValidator, response.body);
  expect(response.body.errors.length).toBe(1);
  const [error] = response.body.errors;
  expect(error.type).toEqual("http");
  expect(error.code).toEqual("UNAUTHORIZED");
}

export { getAuthenticatedAgent, expectEndpointToRequireAuth, type HTTPMethod };
