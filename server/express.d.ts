import { ResponseBody } from "./src/types/responseBody";
import Express from "express";

declare module "express" {
  interface Response extends Express.Response<ResponseBody> {
    json<T = unknown>(body: ResponseBody<T>): this;
    send<T = unknown>(body: ResponseBody<T>): this;
  }
}
