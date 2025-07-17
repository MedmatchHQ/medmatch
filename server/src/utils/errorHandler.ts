import { Request, Response, NextFunction } from "express";
import { GeneralCode, HttpError } from "@/types/errors";
import dotenv from "dotenv";
dotenv.config();

// This function needs the unused "next" parameter to be included in order to work properly
const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  if (process.env.NODE_ENV === "development") {
    console.error("Received by error handler:\n", error);
  }

  if (res === undefined) {
    console.error("Response object is undefined in errorHandler");
    return;
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      status: "error",
      errors: [
        {
          type: error.type,
          details: error.message,
          code: error.code,
        },
      ],
    });
  } else {
    return res.status(500).json({
      status: "error",
      errors: [
        {
          type: "http",
          details: "Internal server error",
          code: GeneralCode.InternalServerError,
        },
      ],
    });
  }
};

/**
 * Decorator that should be attached to all controller methods.
 * It passes any caught error to the error handler and binds the method to the class instance.
 * The error handler will convert any caught `HttpError` to a JSON response and log the error in development.
 * Any other error will be converted to a generic 500 error.
 */
function ControllerMethod() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    if (typeof originalMethod !== "function") {
      throw new Error(`@HandleErrors can only be applied to methods.`);
    }

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        return await originalMethod.call(this, req, res, next);
      } catch (error) {
        next(error);
      }
    };

    // Every time the method is called, it will be bound to the class instance
    return {
      configurable: true,
      enumerable: false,
      get() {
        return descriptor.value!.bind(this);
      },
    };
  };
}

export { errorHandler, ControllerMethod };
