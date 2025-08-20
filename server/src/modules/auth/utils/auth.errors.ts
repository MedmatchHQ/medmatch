import { ConflictError, NotFoundError } from "@/types/errors";

enum AccountCode {
  AccountNotFound = "ACCOUNT_NOT_FOUND",
  AccountConflict = "ACCOUNT_CONFLICT",
}

class AccountNotFoundError extends NotFoundError {
  constructor(message: string = "Account not found") {
    super(message, AccountCode.AccountNotFound);
  }
}

class AccountConflictError extends ConflictError {
  constructor(message: string = "Account already exists") {
    super(message, AccountCode.AccountConflict);
  }
}

export { AccountNotFoundError, AccountConflictError, AccountCode };
