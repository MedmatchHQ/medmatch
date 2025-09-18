import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { JobStatus, WorkType, HoursType } from "@/modules/job-postings/job-posting.model";

class TestPayRangeValidator {
  @IsNumber()
  @Min(0)
  min!: number;

  @IsNumber()
  @Min(0)
  max!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsEnum(["hourly", "monthly", "yearly"])
  period!: "hourly" | "monthly" | "yearly";
}

class TestHoursValidator {
  @IsEnum(HoursType)
  type!: HoursType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  specificHours?: number;
}

class TestCompanyRefValidator {
  @IsMongoId()
  id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  tag!: string;

  @IsOptional()
  @IsString()
  location?: string;
}

class TestJobPostingValidator {
  @IsMongoId()
  id!: string;

  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  // Can be either a string (ObjectId) or populated company object
  companyRef!: string | TestCompanyRefValidator;

  @IsDateString()
  postDate!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsNumber()
  @Min(0)
  numApplicants!: number;

  @IsNumber()
  @Min(1)
  numAccepted!: number;

  @IsEnum(JobStatus)
  jobStatus!: JobStatus;

  @IsEnum(WorkType)
  workType!: WorkType;

  @ValidateNested()
  @Type(() => TestPayRangeValidator)
  payRange!: TestPayRangeValidator;

  @ValidateNested()
  @Type(() => TestHoursValidator)
  hours!: TestHoursValidator;

  @IsDateString()
  deadline!: string;

  @IsArray()
  @IsString({ each: true })
  skillsTags!: string[];

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

  @IsDateString()
  entryDate!: string;
}

export { 
  TestJobPostingValidator, 
  TestPayRangeValidator, 
  TestHoursValidator,
  TestCompanyRefValidator 
};
