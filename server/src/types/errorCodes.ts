import { AccountCode } from "@/modules/auth/utils/auth.errors";
import { FileCode } from "@/modules/files/utils/file.errors";
import { ProfessionalProfileCode } from "@/modules/professional-profiles/utils/professional-profile.errors";
import { StudentProfileCode } from "@/modules/student-profiles/utils/student-profile.errors";
import { GeneralCode } from "@/types/errors";

const allErrorCodes = [
  ...Object.values(GeneralCode),
  ...Object.values(FileCode),
  ...Object.values(AccountCode),
  ...Object.values(StudentProfileCode),
  ...Object.values(ProfessionalProfileCode),
];

type ErrorCode = (typeof allErrorCodes)[number];

export { allErrorCodes, ErrorCode, GeneralCode };
