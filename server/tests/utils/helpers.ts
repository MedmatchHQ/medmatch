import { Response } from "supertest";
import { expectMatch } from "#/utils/validation";
import { SuccessBodyValidator } from "./response.validator";
import { ClassType } from "@/types/validation";

function expectSuccessResponse<T, K extends ClassType<T>>(
  response: Response,
  dataValidator: K | [K],
  data: any
) {
  expect(response.status).toBe(200);
  expect(response.headers["content-type"]).toBe(
    "application/json; charset=utf-8"
  );
  if (Array.isArray(dataValidator)) {
    expectMatch(
      SuccessBodyValidator.withArrayData<T>(dataValidator[0]),
      response.body
    );
  } else {
    expectMatch(SuccessBodyValidator.withData<T>(dataValidator), response.body);
  }
  expect(response.body.data).to(data);
}

export { expectSuccessResponse };
