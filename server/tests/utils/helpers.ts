import { Response as SupertestResponse } from "supertest";
import { Response as ExpressResponse } from "express";
import { expectMatch } from "#/utils/validation";
import {
  HttpErrorBodyValidator,
  SuccessBodyValidator,
} from "#/utils/response.validator";
import { ClassType } from "@/types/validation";
import { HttpError } from "@/types/errors";

/**
 * Expects the given HTTP response to match the structure for a successful response in an integration test.
 * Optionally validates the response body against the provided data validator, and optionally checks if the response data is equal to the provided data.
 *
 * @param response - The HTTP response object to validate.
 * @param dataValidator - An optional validator for the response data. Provide the class inside a tuple if the data is an array (e.g. `dataValidator = [UserValidator]`),
 * or don't provide it to skip data validation.
 * @param data - Optional data to compare against the response body. Exclude it to skip matching to response data.
 * @param overrides.status - The expected HTTP status code (default is 200).
 * @param overrides.contentHeader - The expected content-type header (default is "application/json; charset=utf-8").
 * @template T - The class type of the data validator.
 */
function expectSuccessResponse<T extends ClassType<object>>(
  response: SupertestResponse,
  dataValidator?: T | [T],
  data?: any,
  overrides?: {
    status?: number;
    contentHeader?: string;
    message?: string;
  }
) {
  const {
    status = 200,
    contentHeader = "application/json; charset=utf-8",
    message = expect.any(String),
  } = overrides || {};

  expect(response.status).toBe(status);
  expect(response.headers["content-type"]).toBe(contentHeader);

  if (data !== undefined) {
    const rawData = JSON.parse(JSON.stringify(data));
    expect(response.body.data).toMatchObject<T>(rawData);
  }

  let validator;

  if (dataValidator === undefined) {
    validator = SuccessBodyValidator;
  } else if (Array.isArray(dataValidator)) {
    validator = SuccessBodyValidator.withArrayData(dataValidator[0]);
  } else {
    validator = SuccessBodyValidator.withData(dataValidator);
  }

  expectMatch(validator, response.body);

  expect(response.body.message).toEqual(message);
}

/**
 * Expects the given HTTP response to match the error response structure and values.
 *
 * @param response - The HTTP response object to validate.
 * @param options.status - The expected HTTP status code. Defaults to `400`.
 * @param options.contentHeader - The expected `Content-Type` header value. Defaults to `"application/json; charset=utf-8"`.
 * @param options.errors - An array of partial `HttpError` objects representing the expected errors in the response body. Only included fields will be checked.
 */
function expectHttpErrorResponse(
  response: SupertestResponse,
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
  expectMatch(HttpErrorBodyValidator, response.body);

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

/**
 * Utility function to assert the success response of a controller method in a unit test.
 * @param res - The mocked response object from the controller.
 * @param expectations - The expected values for status, message, and data.
 * @param expectations.status - 200
 * @param expectations.message - Any string (using `expect.any(String)`)
 * @param expectations.data - The expected data in the response
 * @template T - The type of the data in the response.
 */
function expectControllerSuccessResponse<T>(
  res: jest.Mocked<ExpressResponse>,
  expectations: { status?: number; message?: string; data?: T }
) {
  const {
    status = 200,
    message = expect.any(String),
    data,
  } = expectations || {};
  expect(res.status).toHaveBeenCalledWith(status);
  expect(res.json).toHaveBeenCalledWith({
    status: "success",
    message,
    data,
  });
}

export {
  expectSuccessResponse,
  expectHttpErrorResponse,
  expectControllerSuccessResponse,
};
