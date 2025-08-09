import { Transform, Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsISO8601,
} from "class-validator";

class ProfileValidator {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  work?: string;

  @IsOptional()
  @IsString()
  research?: string;

  @IsOptional()
  @IsString()
  volunteering?: string;
}

class UserValidator {
  @IsString()
  @IsNotEmpty()
  first!: string;

  @IsString()
  @IsNotEmpty()
  last!: string;

  @IsISO8601()
  @IsOptional()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  entryDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileValidator)
  profile?: ProfileValidator;
}

export { UserValidator, ProfileValidator };
