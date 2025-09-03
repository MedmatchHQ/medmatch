import { Transform } from "class-transformer";
import {
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

class ProfessionalProfileValidator {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  mission?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  @IsNotEmpty()
  tag!: string;

  @IsMongoId()
  accountId!: string;

  @IsISO8601()
  @IsOptional()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  entryDate?: string;
}

export { ProfessionalProfileValidator };
