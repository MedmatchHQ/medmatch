import { UnauthorizedError } from "@/types/errors";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate the user using JWT.
 * It checks for the presence of an authorization header,
 * verifies the token, and adds the user email and id to `res.locals.user`.
 * Moves to the next middleware if authentication is successful.
 * @throws An {@link UnauthorizedError} if the token is missing, invalid, or has an invalid payload shape.
 */
async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnauthorizedError("No authorization header provided");
    }
    
    // Extract token from "Bearer <token>" format
    const token = authorization.split(" ")[1];
  
    if (token === undefined) {
      throw new UnauthorizedError("No token provided");
    }
  
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    } catch (error) {
      throw new UnauthorizedError("Unauthorized token");
    }
  
    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.email !== "string" ||
      typeof decoded.id !== "string"
    ) {
      throw new UnauthorizedError("Invalid payload shape");
    }
  
    res.locals.user = {
      email: decoded.email,
      id: decoded.id,
    }
    next();
  } catch (error) {
    next(error);
  }
}

export { authenticate };
