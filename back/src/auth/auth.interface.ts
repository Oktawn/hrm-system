export interface TokenPayload {
  userId: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface IRegister {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

export interface ILogin {
  email: string;
  password: string;
}