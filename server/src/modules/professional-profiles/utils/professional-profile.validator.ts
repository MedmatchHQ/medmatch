import { Transform } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsISO8601,
  IsMongoId,
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
