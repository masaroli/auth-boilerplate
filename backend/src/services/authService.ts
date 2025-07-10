import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import config from "../config";
import {
  RegisterUserDto,
  LoginUserDto,
  UserProfileDto,
} from "../dtos/auth.dto";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validations/authValidations";
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
} from "../utils/errors";
import UserModel from "../models/User/User";
import { ErrorCodes } from "../types/errorCodes";

/**
 * Registers a new user.
 * @param userData - Data for the new user (fullName, email, password, role).
 * @returns A promise that resolves to the newly created user's profile DTO.
 * @throws Error if user with email already exists or if password validation fails.
 */
export const register = async (
  userData: RegisterUserDto
): Promise<UserProfileDto> => {
  // --- Joi Validation ---
  const { error } = registerUserSchema.validate(userData, {
    abortEarly: false,
  });

  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  // --- End Joi Validation ---

  const { fullName, email, password, role } = userData;

  const existingUser = await UserModel.findOne({ email }); // <--- Mongoose method, it's async!

  if (existingUser) {
    throw new ConflictError(
      "User with this email already exists.",
      ErrorCodes.EMAIL_ALREADY_REGISTERED
    );
  }

  const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);
  const roles = role ? [role.toLowerCase()] : ["user"];

  // Use Mongoose to create a new user
  const newUserDoc = await UserModel.create({
    fullName,
    email,
    passwordHash,
    roles,
  });

  // Map the Mongoose document to your UserProfileDto
  return {
    id: newUserDoc._id.toString(),
    fullName: newUserDoc.fullName,
    email: newUserDoc.email,
    roles: newUserDoc.roles,
  };
};

/**
 * Authenticates a user and generates a JWT.
 * @param credentials - User login credentials (email, password).
 * @returns A promise that resolves to the JWT token.
 * @throws Error if credentials are invalid.
 */
export const login = async (credentials: LoginUserDto): Promise<string> => {
  // --- Joi Validation ---
  const { error } = loginUserSchema.validate(credentials);
  if (error) {
    // Throw the first validation error message
    throw new ValidationError(error.details[0].message);
  }
  // --- End Joi Validation ---

  const { email, password } = credentials;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new AuthenticationError(
      "Invalid email or password.",
      ErrorCodes.INVALID_CREDENTIALS
    );
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new AuthenticationError(
      "Invalid email or password.",
      ErrorCodes.INVALID_CREDENTIALS
    );
  }

  const payload = {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    roles: user.roles,
  };

  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
  return token;
};

/**
 * Retrieves a user's profile data.
 * @param userId - The ID of the user.
 * @param userFullName - The full name of the user.
 * @param userEmail - The email of the user.
 * @param userRoles - The roles of the user.
 * @returns The user's profile DTO.
 */
export const getProfileData = (
  userId: string,
  userFullName: string,
  userEmail: string,
  userRoles: string[]
): UserProfileDto => {
  return {
    id: userId,
    fullName: userFullName,
    email: userEmail,
    roles: userRoles,
  };
};
