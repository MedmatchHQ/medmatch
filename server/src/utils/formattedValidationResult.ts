import { IValidationError } from "@/types/errors";
import { validationResult } from "express-validator";

/**
 * Formats the `express-validator` validation result to the custom `ValidationError` type.
 */
const formattedValidationResult = validationResult.withDefaults({
  formatter: (error) =>
    ({
      type: "validation",
      loc: error.type === "field" ? error.location : "other",
      field: error.type === "field" ? error.path : "no_field",
      details: error.msg,
    } as IValidationError),
});

export default formattedValidationResult;
