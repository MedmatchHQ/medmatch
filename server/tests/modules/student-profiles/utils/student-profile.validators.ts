import {
  IsString,
  IsOptional,
  IsMongoId,
  IsDate,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class TestExperienceValidator {
  @IsMongoId()
  id!: string;

  @IsString()
  jobTitle!: string;

  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date | null;

  @IsOptional()
  @IsString()
  description?: string | null;
}

class TestStudentProfileValidator {
  @IsMongoId()
  id!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  fullName!: string;

  @IsMongoId()
  accountId!: string;

  @IsDate()
  @Type(() => Date)
  entryDate!: Date;

  @IsOptional()
  @IsString()
  about?: string | null;

  @IsOptional()
  picture?: any;

  @IsOptional()
  resume?: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestExperienceValidator)
  experiences!: TestExperienceValidator[];
}

export { TestStudentProfileValidator, TestExperienceValidator };
