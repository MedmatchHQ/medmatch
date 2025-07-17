import { UserService } from "@/modules/users/user.service";

const createMockUserService = () => {
  const userService = {} as jest.Mocked<UserService>;
  userService.getAllUsers = jest.fn();
  userService.getUserById = jest.fn();
  userService.createUser = jest.fn();
  userService.updateUser = jest.fn();
  userService.deleteUser = jest.fn();
  userService.addFile = jest.fn();
  userService.removeFile = jest.fn();
  return userService;
};

export { createMockUserService };
