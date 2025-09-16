import { ControllerMethod } from "@/utils/errorHandler";
import { AuthService } from "@/modules/auth/auth.service";
import { Request, Response } from "express";
import { UnauthorizedError } from "@/types/errors";
import { CreateAccountInput } from "./auth.model";

class AuthController {
  constructor(private authService: AuthService = new AuthService()) {}

  /**
   * Validates the account email and password, generating a refresh and access token on success,
   * and adds the refresh token to the response cookies.
   * This function expects the request body to be validated with the following parameters.
   * @param {string} req.body.email Account email
   * @param {string} req.body.password Account password
   * @returns The account object along with the access and refresh tokens
   * @codes 200, 401
   * @throws An {@link UnauthorizedError} if the account is not found or the password is incorrect
   */
  @ControllerMethod()
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const account = await this.authService.login(email, password);
    const [accessToken, refreshToken] = await this.addTokens(
      res,
      account.email,
      account.id
    );

    res.status(200).json({
      status: "success",
      data: { ...account, accessToken, refreshToken },
      message: `Account with email ${account.email} logged in successfully`,
    });
  }

  /**
   * Creates a new account based on the provided account data, along with a refresh token and an access token.
   * Adds the refresh token to the response cookies.
   * This function expects the request body to be validated with the following parameters.
   * @param {CreateAccountInput} req.body The input account data used to create a new account
   * @returns The newly created account object along with the access and refresh tokens
   * @codes 201, 409
   * @throws An {@link AccountConflictError} if the account already exists
   */
  @ControllerMethod()
  async signup(req: Request, res: Response): Promise<void> {
    const accountData: CreateAccountInput = req.body;
    const account = await this.authService.signup(accountData);
    const [accessToken, refreshToken] = await this.addTokens(
      res,
      account.email,
      account.id
    );

    res.status(201).json({
      status: "success",
      data: { ...account, accessToken, refreshToken },
      message: `Account with email ${account.email} signed up successfully`,
    });
  }

  /**
   * Clears the refresh token cookie, preventing further access to the application.
   * @returns null
   * @codes 200
   * @note This function does not require any parameters.
   */
  @ControllerMethod()
  async logout(_: Request, res: Response): Promise<void> {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json({
      status: "success",
      data: null,
      message: "Account logged out successfully",
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
   * @param email Account email
   * @param id Account id
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

  /**
   * Retrieves a student profile by their associated account ID with populated files.
   * @param {string} req.params.accountId The unique identifier of the account associated with the student profile
   * @returns The student profile object if found
   * @codes 200, 404
   * @throws A {@link StudentProfileNotFoundError} if no student profile is associated with the specified account id
   */
  @ControllerMethod()
  async getStudentProfile(req: Request, res: Response): Promise<void> {
    const { accountId } = req.params;
    const profile = await this.authService.getStudentProfile(accountId);
    res.status(200).json({
      status: "success",
      data: profile,
      message: `Student profile for account ${accountId} retrieved successfully`,
    });
  }

  /**
   * Retrieves a professional profile by their associated account ID.
   * @param {string} req.params.accountId The unique identifier of the account associated with the professional profile
   * @returns The professional profile object if found
   * @codes 200, 404
   * @throws A {@link ProfessionalProfileNotFoundError} if no professional profile is associated with the specified account id
   */
  @ControllerMethod()
  async getProfessionalProfile(req: Request, res: Response): Promise<void> {
    const { accountId } = req.params;
    const profile = await this.authService.getProfessionalProfile(accountId);
    res.status(200).json({
      status: "success",
      data: profile,
      message: `Professional profile for account ${accountId} retrieved successfully`,
    });
  }
}

export { AuthController };
