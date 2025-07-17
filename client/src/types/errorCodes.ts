enum GeneralCode {
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  BadRequest = 'BAD_REQUEST',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
  Conflict = 'CONFLICT',
}

enum UserCode {
  UserNotFound = 'USER_NOT_FOUND',
  UserConflict = 'USER_CONFLICT',
  InvalidCredentials = 'INVALID_CREDENTIALS',
}

enum ProfileCode {
  ProfileNotFound = 'PROFILE_NOT_FOUND',
}

enum FileCode {
  FileNotFound = 'FILE_NOT_FOUND',
  FileConflict = 'FILE_CONFLICT',
}

type ErrorCode = GeneralCode | UserCode | ProfileCode | FileCode;

export type { ErrorCode };
export { GeneralCode, UserCode, ProfileCode, FileCode };