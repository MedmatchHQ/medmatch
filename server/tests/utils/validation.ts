import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import mongoose from "mongoose";
import { ValidationErrorBodyValidator } from "#/utils/response.validator";
import { Response } from "supertest";
import { ErrorLocation, IValidationError } from "@/types/errors";
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
  if (obj == null) {
    throw new Error("Object to validate cannot be null or undefined");
  }
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
 * @param fieldName The name of the field that should be validated. Defaults to "id".
 */
async function expectIdValidationError(
  response: Response,
  fieldName: string = "id"
): Promise<void> {
  expect(response.status).toBe(400);
  expect(response.headers["content-type"]).toBe(
    "application/json; charset=utf-8"
  );
  await expectMatch(response.body, ValidationErrorBodyValidator);
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
 * @param expectedFields The list of expected invalid fields. Specifically the ones that appear in the `field` property of each validation error.
 * @param loc The location of the validation error, defaults to "body".
 */
async function expectValidationErrors(
  response: Response,
  expectedFields: string[],
  loc: ErrorLocation = "body",
  options?: { status?: number }
) {
  const { status = 400 } = options || {};

  expect(response.status).toBe(status);
  expect(response.headers["content-type"]).toContain(
    "application/json; charset=utf-8"
  );
  await expectMatch(response.body, ValidationErrorBodyValidator);

  const errors: IValidationError[] = response.body.errors;
  await expectMatch(response.body, ValidationErrorBodyValidator);
  expect(errors.length).toBeGreaterThanOrEqual(expectedFields.length);
  expect(errors.map((e) => e.loc)).toContain(loc);

  const actualFields = errors.map((e) => e.field);
  expectedFields.forEach((expectedField) => {
    expect(actualFields).toContain(expectedField);
  });
}

export { expectMatch, expectIdValidationError, expectValidationErrors };
