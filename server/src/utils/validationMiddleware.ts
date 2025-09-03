import { NextFunction, Request, RequestHandler, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  param,
  validationResult,
  ValidationError as ExpressValidationError,
  check,
} from "express-validator";
import { ValidationError as ClassValidationError } from "class-validator";
import { IValidationError } from "@/types/errors";
import { FileValidator } from "@/modules/files";
import { ErrorResponseBody } from "@/types/responseBody";

/** Represents a constructor for a class */
type ClassType<T> = { new (...args: any[]): T };

/**
 * Returns a request handler that validates the request body against a class defined with `class-validator`.
 * Adds any found errors to the `res.locals.classValidatorErrors` array.
 * @param classType The class to validate the request body against
 * @param isPartial Whether the validator should skip missing properties
 * @returns An express request handler that validates the request body
 */
function validateObjectByClass<T extends object>(
  classType: ClassType<T>,
  isPartial: boolean,
  field: "body" | "file"
): RequestHandler {
  return async (
    req: Request,
    res: Response & {
      locals: { classValidatorErrors?: ClassValidationError[] };
    },
    next: NextFunction
  ): Promise<void> => {
    try {
      const instance = plainToInstance(classType, req[field]);
      const result = await validate(instance, {
        skipMissingProperties: isPartial,
      });
      if (result.length > 0) {
        const errors = res.locals.classValidatorErrors;
        res.locals.classValidatorErrors = errors
          ? errors.concat(result)
          : result;
      }
      req[field] = instance; // Remove extra fields
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Returns a request handler that validates the request body against
 * a class defined with `class-validator`, ensuring they are an exact match.
 * Most commonly used for POST requests.
 * @param classType The class to validate the request body against
 */
const validateBody = <T extends object>(
  classType: ClassType<T>
): RequestHandler => validateObjectByClass<T>(classType, false, "body");

/**
 * Returns a request handler that validates the request body against a class
 * defined with `class-validator`, only checking the fields present in the body.
 * Most commonly used for PUT/PATCH requests.
 * @param classType The class to validate the request body against
 */
const validatePartialBody = <T extends object>(
  classType: ClassType<T>
): RequestHandler => validateObjectByClass<T>(classType, true, "body");

/**
 * Returns a request handler that validates the file on the request object
 * against a class defined with `class-validator`.
 * @param classType The class to validate the file against
 */
const validateFile = <T extends object>(
  classType: ClassType<T>
): RequestHandler[] => [
  (req, res, next) => {
    if (!req.file) {
      const error: ErrorResponseBody = {
        status: "error",
        errors: [
          {
            type: "validation",
            loc: "file",
            field: "file",
            details: "No file uploaded",
          },
        ],
      };
      return res.status(400).json(error);
    }
    next();
  },
  validateObjectByClass<T>(classType, true, "file"),
];

/**
 * Returns a request handler that validates a path param as a MongoDB ID.
 * @param paramName Name of the path param to be validated (default is "id").
 */
const validateId = (paramName: string = "id"): RequestHandler =>
  param(paramName)
    .isMongoId()
    .withMessage(`Path parameter ${paramName} is not a valid MongoID`);

const formatExpressError = (
  error: ExpressValidationError
): IValidationError => ({
  type: "validation",
  loc: error.type === "field" ? error.location : "other",
  field: error.type === "field" ? error.path : "no_field",
  details: error.msg,
});

/**
 * Formats the `express-validator` validation result to the custom `ValidationError` type.
 */
const formatExpressErrors = (
  expressErrors: ExpressValidationError[]
): IValidationError[] => {
  const newErrors: IValidationError[] = [];

  for (const err of expressErrors) {
    if (err.type === "alternative_grouped" || err.type === "alternative") {
      newErrors.push(...err.nestedErrors.flat().map(formatExpressError));
    } else {
      newErrors.push(formatExpressError(err));
    }
  }

  return newErrors;
};

const formatClassError = (
  error: ClassValidationError,
  message: string
): IValidationError => ({
  type: "validation",
  loc: error.target instanceof FileValidator ? "file" : "body",
  field: error.property,
  details: message,
});

/**
 * Formats the class validation errors to the custom `IValidationError` type.
 */
function formatClassErrors(
  classErrors: ClassValidationError[]
): IValidationError[] {
  const newErrors: IValidationError[] = [];

  for (const err of classErrors.flat()) {
    if (err.children === undefined || err.children.length === 0) {
      newErrors.push(
        ...Object.values(err.constraints ?? {}).map((msg) =>
          formatClassError(err, msg)
        )
      );
    } else {
      newErrors.push(...formatClassErrors(err.children));
    }
  }

  return newErrors;
}

/**
 * Middleware that checks if there are any validation errors in the request.
 * If there are, it sends a response with status 400 and the errors.
 */
function endValidation(req: Request, res: Response, next: NextFunction): any {
  const expressValidatorErrors = formatExpressErrors(
    validationResult(req).array()
  );
  const classValidatorErrors = formatClassErrors(
    res.locals.classValidatorErrors ?? []
  );
  const errors = [...expressValidatorErrors, ...classValidatorErrors];
  if (errors.length > 0) {
    return res.status(400).json({
      status: "error",
      errors: errors,
    });
  }
  next();
}

/**
 * Helper function that handles any validation middlewares. To be placed before the controller.
 * Note: Each validation middleware should add any errors to the `formattedValidationResult` array.
 * @param validations Any number of validation middlewares
 * @returns A list of validation middlewares that is handled before the controller executes.
 */
function validation(
  ...validations: (RequestHandler | RequestHandler[])[]
): RequestHandler[] {
  return [...validations.flat(), endValidation];
}

export {
  validation,
  validateBody,
  validatePartialBody,
  validateId,
  validateFile,
  formatClassErrors,
};
