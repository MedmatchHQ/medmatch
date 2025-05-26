import { GeneralCode } from '@/types/errors';
import { UserCode, ProfileCode } from '@/modules/users';
import { FileCode } from '@/modules/files';

const allErrorCodes = [
  ...Object.values(GeneralCode),
  ...Object.values(UserCode),
  ...Object.values(ProfileCode),
  ...Object.values(FileCode),
]

type ErrorCode = typeof allErrorCodes[number];

export { allErrorCodes, ErrorCode, GeneralCode };
