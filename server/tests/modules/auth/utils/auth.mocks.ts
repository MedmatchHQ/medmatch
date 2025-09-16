import { AuthService } from "@/modules/auth/auth.service";

const createMockAuthService = () => {
  const authService = {} as jest.Mocked<AuthService>;
  authService.login = jest.fn();
  authService.signup = jest.fn();
  authService.generateAccessToken = jest.fn();
  authService.generateRefreshToken = jest.fn();
  return authService;
};

export { createMockAuthService };
