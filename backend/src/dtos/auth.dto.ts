import { UserRole } from "../types/userRoles";

export interface RegisterUserDto {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UserProfileDto {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
}

export interface ResetPasswordDto {
  newPassword: string;
}
