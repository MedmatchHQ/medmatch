import { Response } from "supertest";
import { expectMatch } from "#/utils/validation";
import {
  HttpErrorBodyValidator,
  SuccessBodyValidator,
} from "#/utils/response.validator";
import { ClassType } from "@/types/validation";
import { HttpError } from "@/types/errors";

/**
 * Expects the given HTTP response to match the expected structure for a successful response.
 * Checks the status code, content-type header, optionally validates the response body
 * against the provided data validator, and optionally checks if the response data is equal to the provided data.
 *
 * @param response - The HTTP response object to validate.
 * @param dataValidator - An optional validator for the response data. Provide the class inside a tuple if the data is an array (e.g. `dataValidator = [UserValidator]`),
 * or don't provide it to skip data validation.
 * @param data - Optional data to compare against the response body. Exclude it to skip matching to response data.
 * @param overrides.status - The expected HTTP status code (default is 200).
 * @param overrides.contentHeader - The expected content-type header (default is "application/json; charset=utf-8").
 * @template T - The class type of the data validator.
 */
async function expectSuccessResponse<T extends ClassType<object>>(
  response: Response,
  dataValidator?: T | [T],
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
    expect(response.body.data).toMatchObject<T>(rawData);
  }

  if (dataValidator === undefined) {
    return;
  } else if (Array.isArray(dataValidator)) {
    await expectMatch(
      SuccessBodyValidator.withArrayData(dataValidator[0]),
      response.body
    );
  } else {
    await expectMatch(
      SuccessBodyValidator.withData(dataValidator),
      response.body
    );
  }
}

/**
 * Asserts that an HTTP response matches the expected error response structure and values.
 * Checks the status code, content-type header, validates the response body, and optionally checks for specific error details in the response body.
 *
 * @param response - The HTTP response object to validate.
 * @param options.status - The expected HTTP status code. Defaults to `400`.
 * @param options.contentHeader - The expected `Content-Type` header value. Defaults to `"application/json; charset=utf-8"`.
 * @param options.errors - An array of partial `HttpError` objects representing the expected errors in the response body. Only included fields will be checked.
 */
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
