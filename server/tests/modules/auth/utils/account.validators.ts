import { IsEmail, IsNotEmpty, IsString } from "class-validator";

class TestAccountValidator {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  entryDate!: string;
}

export { TestAccountValidator };
