import { Request } from 'express';
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
}

export interface ILogin {
  email: string;
  password: string;
}
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}
export interface AuthenticatedRequestBot extends Request {
  bot?: {
    tgID: number;
  };
}