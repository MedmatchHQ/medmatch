import { ApiErrors } from "../responses";

class UnexpectedError extends Error {
  constructor(
    public cause?: any,
    message: string = "An unexpected error occurred"
  ) {
    super(message);
    this.name = "ServerError";
  }
}

class NotFoundError extends Error {
  constructor(public cause?: any, message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

class ValidationErrors extends Error {
  constructor(
    public errors: ApiErrors,
    message: string = "Validation errors occurred"
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export { NotFoundError, UnexpectedError, ValidationErrors };
