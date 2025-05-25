import { ProfileValidator, UserValidator } from "@/modules/users";
import {
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "class-validator";
import { Types } from "mongoose";
import { Type } from "class-transformer";

class TestFileValidator {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsIn(["image/jpeg", "image/png", "application/pdf"])
  type!: string;

  @IsNotEmpty()
  data!: Buffer;
}

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
