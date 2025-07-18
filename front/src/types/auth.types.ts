
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user?: User;
}

export interface User {
  id: string;
  employeeId?: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  department?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileResponse {
  message: string;
  user: User;
}
