import MaxBufferSize from "@/utils/maxBufferSize";
import { IsDefined, IsIn, IsNotEmpty, IsString } from "class-validator";

class FileValidator {
  @IsString()
  @IsNotEmpty()
  originalname!: string;

  @IsString()
  @IsIn(["image/jpeg", "image/png", "application/pdf"])
  mimetype!: string;

  @IsDefined()
  @MaxBufferSize(5)
  buffer!: Buffer;
}

export { FileValidator };
