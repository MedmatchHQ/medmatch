import { GeneralCode } from "@/types/errors";
import { FileCode } from "@/modules/files";
import { AccountCode } from "@/modules/auth";
import { StudentProfileCode } from "@/modules/student-profiles/utils/student-profile.errors";
import { ProfessionalProfileCode } from "@/modules/professional-profiles/utils/professional-profile.errors";

const allErrorCodes = [
  ...Object.values(GeneralCode),
  ...Object.values(FileCode),
  ...Object.values(AccountCode),
  ...Object.values(StudentProfileCode),
  ...Object.values(ProfessionalProfileCode),
];

type ErrorCode = (typeof allErrorCodes)[number];

export { allErrorCodes, ErrorCode, GeneralCode };
