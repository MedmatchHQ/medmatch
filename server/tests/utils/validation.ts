import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import mongoose from "mongoose";
import { ValidationErrorBodyValidator } from "#/utils/response.validator";
import { Response } from "supertest";
import { IValidationError } from "@/types/errors";
import { formatClassErrors } from "@/utils/validationMiddleware";

type ClassType<T> = { new (...args: any[]): T };

/**
 * Validates that an object matches the shape of a class.
 * @param classType The class to validate against.
 * @param obj The object to validate.
 */
async function expectMatch<T extends object>(
  classType: ClassType<T>,
  obj: object
) {
  // If obj is a Mongoose document, convert it to a plain object
  const plainObj =
    obj instanceof mongoose.Model || typeof (obj as any).toObject === "function"
      ? (obj as any).toObject()
      : obj;
  const instance = plainToInstance(classType, plainObj);
  const errors = await validate(instance);
  if (errors.length > 0) {
    console.error("Validation errors:", formatClassErrors(errors));
  }
  expect(errors.length).toBe(0);
}

/**
 * Set of expectations that checks if the response validates the id parameter.
 * @param response The response to check.
 */
function expectIdValidationError(
  response: Response,
  fieldName: string = "id"
): void {
  expect(response.status).toBe(400);
  expect(response.headers["content-type"]).toBe(
    "application/json; charset=utf-8"
  );
  expectMatch(response.body, ValidationErrorBodyValidator);
  expect(response.body.errors.length).toBeGreaterThanOrEqual(1);
  const [error] = response.body.errors;
  expect(error.loc).toEqual("params");
  expect(error.field).toEqual(fieldName);
  expect(error.details).toEqual(
    `Path parameter ${fieldName} is not a valid MongoID`
  );
}

/**
 * Helper function that checks if the response contains validation errors that match the invalid fields.
 * @param response The response to check.
 * @param invalidFields The list of invalid fields. Specifically the ones that appear in the `field` property of each validation error.
 */
function expectValidationErrors(
  response: Response,
  invalidFields: string[],
  loc: string = "body"
) {
  expect(response.status).toBe(400);
  expect(response.headers["content-type"]).toContain(
    "application/json; charset=utf-8"
  );
  expectMatch(response.body, ValidationErrorBodyValidator);

  const errors: IValidationError[] = response.body.errors;
  expectMatch(response.body, ValidationErrorBodyValidator);
  expect(errors.length).toBeGreaterThanOrEqual(invalidFields.length);
  expect(errors.every((e) => e.loc === loc)).toBeTruthy();

  const errorFields = errors.map((e) => e.field);
  expect(invalidFields.every((k) => errorFields.includes(k)));
}

export { expectMatch, expectIdValidationError, expectValidationErrors };
