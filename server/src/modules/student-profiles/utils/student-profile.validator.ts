import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class ExperienceValidator {
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @IsISO8601()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  startDate!: string;

  @IsOptional()
  @IsISO8601()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class StudentProfileValidator {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsMongoId()
  picture?: string;

  @IsOptional()
  @IsMongoId()
  resume?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceValidator)
  experiences?: ExperienceValidator[];

  @IsMongoId()
  accountId!: string;

  @IsISO8601()
  @IsOptional()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  entryDate?: string;
}

export { ExperienceValidator, StudentProfileValidator };
