import { IsIn, IsNotEmpty, IsString } from "class-validator";

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

export { TestFileValidator };
