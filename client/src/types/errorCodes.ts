enum GeneralCode {
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  BadRequest = 'BAD_REQUEST',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
  Conflict = 'CONFLICT',
}

enum StudentProfileCode {
  StudentProfileNotFound = "STUDENT_PROFILE_NOT_FOUND",
  ExperienceNotFound = "EXPERIENCE_NOT_FOUND",
}

enum FileCode {
  FileNotFound = 'FILE_NOT_FOUND',
  FileConflict = 'FILE_CONFLICT',
}

enum AccountCode {
  AccountNotFound = "ACCOUNT_NOT_FOUND",
  AccountConflict = "ACCOUNT_CONFLICT",
}

type ErrorCode = GeneralCode | StudentProfileCode | FileCode | AccountCode;

export type { ErrorCode };
export { GeneralCode, StudentProfileCode, FileCode, AccountCode };