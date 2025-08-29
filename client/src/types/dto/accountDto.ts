export type Account = {
  id: string,
  email: string,
  password: string,
  entryDate: Date
}

export type AccountWithTokens = Account & {
  accessToken: string,
  refreshToken: string
}

export type CreateAccountInput = {
  email: string,
  password: string
}