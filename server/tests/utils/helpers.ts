import { Response } from "supertest";
import { expectMatch } from "#/utils/validation";
import {
  HttpErrorBodyValidator,
  SuccessBodyValidator,
} from "#/utils/response.validator";
import { ClassType } from "@/types/validation";
import { HttpError } from "@/types/errors";

async function expectSuccessResponse<T, K extends ClassType<T>>(
  response: Response,
  dataValidator?: K | [K],
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

  if (data !== undefined) {
    const rawData = JSON.parse(JSON.stringify(data));
    expect(response.body.data).toMatchObject<K>(rawData);
  }

  if (dataValidator === undefined) {
    return;
  } else if (Array.isArray(dataValidator)) {
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
}

async function expectHttpErrorResponse(
  response: Response,
  options: {
    status?: number;
    contentHeader?: string;
    errors?: Partial<HttpError>[];
  }
) {
  const {
    status = 400,
    contentHeader = "application/json; charset=utf-8",
    errors,
  } = options || {};

  expect(response.status).toBe(status);
  expect(response.headers["content-type"]).toBe(contentHeader);
  await expectMatch(HttpErrorBodyValidator, response.body);

  if (errors !== undefined) {
    const { errors: responseErrors } = response.body;
    expect(responseErrors.length).toBe(errors.length);
    for (const error of errors) {
      const { type, details, code } = error;
      expect(responseErrors).toContainEqual({
        type: type ?? "http",
        details: details ?? expect.stringMatching(/.*/),
        code: code ?? expect.stringMatching(/.*/),
      });
    }
  }
}

export { expectSuccessResponse, expectHttpErrorResponse };
