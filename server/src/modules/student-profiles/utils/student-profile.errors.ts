import { NotFoundError } from "@/types/errors";

enum StudentProfileCode {
  StudentProfileNotFound = "STUDENT_PROFILE_NOT_FOUND",
  ExperienceNotFound = "EXPERIENCE_NOT_FOUND",
}

class StudentProfileNotFoundError extends NotFoundError {
  constructor(message: string = "Student profile not found") {
    super(message, StudentProfileCode.StudentProfileNotFound);
  }
}

class ExperienceNotFoundError extends NotFoundError {
  constructor(message: string = "Experience not found") {
    super(message, StudentProfileCode.ExperienceNotFound);
  }
}

export {
  ExperienceNotFoundError,
  StudentProfileCode,
  StudentProfileNotFoundError,
};
