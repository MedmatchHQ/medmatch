import { GeneralCode } from "@/types/errors";
import { UserCode, ProfileCode } from "@/modules/users";
import { FileCode } from "@/modules/files";
import { AccountCode } from "@/modules/auth";
import { StudentProfileCode } from "@/modules/users/utils/student-profile.errors";
import { ProfessionalProfileCode } from "@/modules/professional-profiles/utils/professional-profile.errors";

const allErrorCodes = [
  ...Object.values(GeneralCode),
  ...Object.values(UserCode),
  ...Object.values(ProfileCode),
  ...Object.values(FileCode),
  ...Object.values(AccountCode),
  ...Object.values(StudentProfileCode),
  ...Object.values(ProfessionalProfileCode),
];

type ErrorCode = (typeof allErrorCodes)[number];

export { allErrorCodes, ErrorCode, GeneralCode };
