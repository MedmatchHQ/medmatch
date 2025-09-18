import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
  Min,
} from "class-validator";
import { JobStatus, WorkType, HoursType } from "../job-posting.model";

class PayRangeValidator {
  @IsNumber()
  @IsPositive()
  min!: number;

  @IsNumber()
  @IsPositive()
  max!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsEnum(["hourly", "monthly", "yearly"])
  period!: "hourly" | "monthly" | "yearly";
}

class HoursValidator {
  @IsEnum(HoursType)
  type!: HoursType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  specificHours?: number;
}

class JobPostingValidator {
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @IsMongoId()
  companyRef!: string;

  @IsISO8601()
  @IsOptional()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  postDate?: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  numApplicants?: number;

  @IsNumber()
  @IsPositive()
  numAccepted!: number;

  @IsEnum(JobStatus)
  @IsOptional()
  jobStatus?: JobStatus;

  @IsEnum(WorkType)
  workType!: WorkType;

  @ValidateNested()
  @Type(() => PayRangeValidator)
  payRange!: PayRangeValidator;

  @ValidateNested()
  @Type(() => HoursValidator)
  hours!: HoursValidator;

  @IsDateString()
  deadline!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skillsTags?: string[];

  @IsOptional()
  @IsString()
  @IsUrl()
  externalApplicationLink?: string;

  @IsString()
  @IsNotEmpty()
  about!: string;

  @IsString()
  @IsNotEmpty()
  qualifications!: string;

  @IsString()
  @IsNotEmpty()
  responsibilities!: string;

  @IsISO8601()
  @IsOptional()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  entryDate?: string;
}

export { JobPostingValidator, PayRangeValidator, HoursValidator };
