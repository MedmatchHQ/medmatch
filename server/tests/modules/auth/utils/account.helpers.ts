import {
  AccountModel,
  Account,
  CreateAccountInput,
} from "@/modules/auth/auth.model";
import bcrypt from "bcrypt";

const getAccountData = (): CreateAccountInput => ({
  email: `test${Date.now()}@example.com`,
  password: "password123",
});

/**
 * @param data Optional data to override the default account data.
 * Defaults to {@link getAccountData}.
 */
async function createTestAccount(
  data?: Partial<CreateAccountInput>
): Promise<Account> {
  const defaultAccount = getAccountData();

  const accountData = {
    ...defaultAccount,
    ...data,
  };

  // Hash the password like the auth service does
  const hashedPassword = await bcrypt.hash(accountData.password, 10);
  const account = new AccountModel({
    ...accountData,
    password: hashedPassword,
  });

  const doc = await account.save();
  return Account.fromDoc(doc);
}

export { createTestAccount, getAccountData };
