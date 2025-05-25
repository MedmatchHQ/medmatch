import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "class-validator";
import { ClassType } from "@/types/validation";
import { Type } from "class-transformer";
import { allErrorCodes, ErrorCode } from "@/types/errorCodes";

class SuccessBodyValidator {
  @IsString()
  @IsIn(["success"])
  status!: "success";

  @IsString()
  @IsNotEmpty()
  message!: string;

  static withData<T>(classType: ClassType<T>) {
    class BodyWithData extends SuccessBodyValidator {
      @ValidateNested()
      @Type(() => classType)
      data!: T;
    }
    return BodyWithData;
  }

  static withArrayData<T>(classType: ClassType<T>) {
    class BodyWithArrayData extends SuccessBodyValidator {
      @IsArray()
      @ValidateNested({ each: true })
      @Type(() => classType)
      data!: T[];
    }
    return BodyWithArrayData;
  }
}

class HttpErrorValidator {
  @IsString()
  @IsIn(["http"])
  type!: "http";

  @IsString()
  @IsNotEmpty()
  details!: string;

  @IsEnum(allErrorCodes)
  code!: ErrorCode;
}

class ValidationErrorValidator {
  @IsString()
  @IsIn(["validation"])
  type!: "validation";

  loc!: Location | "other";

  @IsString()
  @IsNotEmpty()
  field!: string;

  @IsString()
  @IsNotEmpty()
  details!: string;
}

class HttpErrorBodyValidator {
  @IsString()
  @IsIn(["error"])
  status!: "error";

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HttpErrorValidator)
  errors!: HttpErrorValidator[];
}

class ValidationErrorBodyValidator {
  @IsString()
  @IsIn(["error"])
  status!: "error";

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationErrorValidator)
  errors!: ValidationErrorValidator[];
}

export {
  SuccessBodyValidator,
  HttpErrorValidator,
  ValidationErrorValidator,
  HttpErrorBodyValidator,
  ValidationErrorBodyValidator,
};
