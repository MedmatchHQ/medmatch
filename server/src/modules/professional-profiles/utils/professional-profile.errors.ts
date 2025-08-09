import { NotFoundError } from "@/types/errors";

enum ProfessionalProfileCode {
  ProfessionalProfileNotFound = "PROFESSIONAL_PROFILE_NOT_FOUND",
}

class ProfessionalProfileNotFoundError extends NotFoundError {
  constructor(message: string = "Professional profile not found") {
    super(message, ProfessionalProfileCode.ProfessionalProfileNotFound);
  }
}

export { ProfessionalProfileNotFoundError, ProfessionalProfileCode };
