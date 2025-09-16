export type Account = {
  id: string,
  email: string,
  password: string,
  entryDate: Date
}

export type Tokens = {
  refreshToken: string,
  accessToken: string
}

export type AccountWithTokens = Account & Tokens

export type CreateAccountInput = {
  email: string,
  password: string
}

export type SignupInput = {
  first: string,
  last: string,
  phone: string,
  birthday: string,
  email: string,
  password: string
}