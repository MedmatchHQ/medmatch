import { Response } from "supertest";
import { expectMatch } from "#/utils/validation";
import { SuccessBodyValidator } from "./response.validator";
import { ClassType } from "@/types/validation";

async function expectSuccessResponse<T, K extends ClassType<T>>(
  response: Response,
  dataValidator: K | [K],
  data?: any,
  overrides?: {
    status?: number;
    contentHeader?: string;
  }
) {
  const { status = 200, contentHeader = "application/json; charset=utf-8" } =
    overrides || {};

  expect(response.status).toBe(status);
  expect(response.headers["content-type"]).toBe(contentHeader);

  if (Array.isArray(dataValidator)) {
    await expectMatch(
      SuccessBodyValidator.withArrayData<T>(dataValidator[0]),
      response.body
    );
  } else {
    await expectMatch(
      SuccessBodyValidator.withData<T>(dataValidator),
      response.body
    );
  }
  if (data !== undefined) {
    const rawData = JSON.parse(JSON.stringify(data));
    expect(response.body.data).toMatchObject<K>(rawData);
  }
}

export { expectSuccessResponse };
