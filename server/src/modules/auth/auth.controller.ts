import { ControllerMethod } from "@/utils/errorHandler";
import { AuthService } from "@/modules/auth/auth.service";
import { Request, Response } from "express";
import { UnauthorizedError } from "@/types/errors";
import { InputUser } from "@/modules/users";

class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Validates the user email and password, generating a refresh and access token on success,
   * and adds the refresh token to the response cookies.
   * This function expects the request body to be validated with the following parameters.
   * @param {string} req.body.email User email
   * @param {string} req.body.password User password
   * @returns The user object along with the access and refresh tokens
   * @codes 200, 401
   * @throws An {@link UnauthorizedError} if the user is not found or the password is incorrect
   */
  @ControllerMethod()
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const user = await this.authService.login(email, password);
    const [accessToken, refreshToken] = await this.addTokens(
      res,
      user.email,
      user.id
    );

    res.status(200).json({
      status: "success",
      data: { ...user, accessToken, refreshToken },
      message: `User with email ${user.email} logged in successfully`,
    });
  }

  /**
   * Creates a new user based on the provided user data, along with a refresh token and an access token.
   * Adds the refresh token to the response cookies.
   * This function expects the request body to be validated with the following parameters.
   * @param {InputUser} req.body The input user data (no ids, unpopulated files) used to create a new user
   * @returns The newly created user object along with the access and refresh tokens
   * @codes 201, 409
   * @throws A {@link UserConflictError} if the user already exists
   */
  @ControllerMethod()
  async signup(req: Request, res: Response): Promise<void> {
    const userData: InputUser = req.body;
    const user = await this.authService.signup(userData);
    const [accessToken, refreshToken] = await this.addTokens(
      res,
      user.email,
      user.id
    );

    res.status(201).json({
      status: "success",
      data: { ...user, accessToken, refreshToken },
      message: `User with email ${user.email} signed up successfully`,
    });
  }

  /**
   * Clears the refresh token cookie, preventing further access to the application.
   * @returns null
   * @codes 200
   * @throws No errors
   * @note This function does not require any parameters.
   */
  @ControllerMethod()
  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json({
      status: "success",
      data: null,
      message: "User logged out successfully",
    });
  }

  /**
   * Generates an access token using the refresh token from the request cookies.
   * This function expects the refresh token to be present in either the cookies or the body.
   * @param {string} req.cookies.refreshToken The refresh token to verify
   * @returns An object with the access and refresh tokens on success
   * @codes 200, 401
   * @throws An {@link UnauthorizedError} if the refresh token is invalid or expired
   */
  @ControllerMethod()
  async generateAccessToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
    const accessToken = await this.authService.generateAccessToken(
      refreshToken
    );

    res.status(200).json({
      status: "success",
      data: { accessToken, refreshToken },
      message: "Access token refreshed successfully",
    });
  }

  /**
   * Util function that generates a refresh token and an access token, adding the refresh token to the response cookies.
   * This function expects the email and id to be valid.
   * @param res Request handler response object
   * @param email User email
   * @param id User id
   * @returns A tuple with the access token and refresh token on success
   * @throws An {@link UnauthorizedError} if the refresh token created is invalid, possibly due to an invalid email or id
   */
  async addTokens(
    res: Response,
    email: string,
    id: string
  ): Promise<[string, string]> {
    const refreshToken = await this.authService.generateRefreshToken(email, id);
    const accessToken = await this.authService.generateAccessToken(
      refreshToken
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      // This should be the same time frame as the refresh
      // token expiration in the generateRefreshToken auth service method
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return [accessToken, refreshToken];
  }
}

export { AuthController };
