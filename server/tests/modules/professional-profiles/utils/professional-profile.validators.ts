import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

class TestProfessionalProfileValidator {
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
}

export { TestProfessionalProfileValidator };
