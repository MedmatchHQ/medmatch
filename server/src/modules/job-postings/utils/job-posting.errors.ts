import { NotFoundError } from "@/types/errors";

enum JobPostingCode {
  JobPostingNotFound = "JOB_POSTING_NOT_FOUND",
}

class JobPostingNotFoundError extends NotFoundError {
  constructor(message: string = "Job posting not found") {
    super(message, JobPostingCode.JobPostingNotFound);
  }
}

export { JobPostingCode, JobPostingNotFoundError };
