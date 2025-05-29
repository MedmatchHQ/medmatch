import { ProfileValidator, UserValidator } from "@/modules/users";
import { IsArray, IsDefined, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { Type } from "class-transformer";
import { TestFileValidator } from "#/modules/files/util/file.validators";

class TestProfileValidator extends ProfileValidator {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestFileValidator)
  files!: TestFileValidator[];
}

class TestUserValidator extends UserValidator {
  @IsDefined()
  id!: Types.ObjectId;

  @ValidateNested()
  @Type(() => TestProfileValidator)
  profile!: TestProfileValidator;
}

export { TestUserValidator, TestProfileValidator, TestFileValidator };
