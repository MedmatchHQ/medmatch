import { allErrorCodes, ErrorCode } from "@/types/errorCodes";
import { ClassType } from "@/types/validation";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "class-validator";

class SuccessBodyValidator {
  @IsString()
  @IsIn(["success"])
  status!: "success";

  @IsString()
  @IsNotEmpty()
  message!: string;

  static withData<T extends object>(classType: ClassType<T>) {
    class BodyWithData extends SuccessBodyValidator {
      @ValidateNested()
      @Type(() => classType)
      data!: T;
    }
    return BodyWithData;
  }

  static withArrayData<T extends object>(classType: ClassType<T>) {
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
  HttpErrorBodyValidator,
  HttpErrorValidator,
  SuccessBodyValidator,
  ValidationErrorBodyValidator,
  ValidationErrorValidator,
};
