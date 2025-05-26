import { ConflictError, NotFoundError } from "@/types/errors";

enum FileCode {
  FileNotFound = 'FILE_NOT_FOUND',
  FileConflict = 'FILE_CONFLICT',
}

class FileNotFoundError extends NotFoundError {
  constructor(message: string = "File not found") {
    super(message, FileCode.FileNotFound);
  }
}

class FileConflictError extends ConflictError {
  constructor(message: string = "File already exists") {
    super(message, FileCode.FileConflict);
  }
}

export { FileNotFoundError, FileConflictError, FileCode };
