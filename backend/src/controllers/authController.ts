import { Request, Response } from "express";

import * as authService from "../services/authService";
import {
  RegisterUserDto,
  LoginUserDto,
  UserProfileDto,
} from "../dtos/auth.dto";
import {
  AuthenticationError,
  ConflictError,
  ValidationError,
} from "../utils/errors";
import { ErrorCodes } from "../types/errorCodes";

/**
 * @description Registers a new user.
 * @access Public
 */
export const registerUser = async (
  req: Request<{}, {}, RegisterUserDto>,
  res: Response
) => {
  try {
    const userProfile: UserProfileDto = await authService.register(req.body);
    console.log(
      "Registered user:",
      userProfile.fullName,
      "with roles:",
      userProfile.roles
    );
    res
      .status(201)
      .json({ message: "User registered successfully!", user: userProfile });
  } catch (error: any) {
    // Use 'any' for now, refine with type guards later
    console.error("Registration error:", error.message);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message, code: error.code });
      return;
    }
    if (error instanceof ConflictError) {
      res.status(409).json({ message: error.message, code: error.code });
      return;
    }
    res.status(500).json({
      message: "Server error during registration.",
      code: ErrorCodes.SERVER_ERROR,
    });
  }
};

/**
 * @description Authenticates a user and returns a JWT.
 * @access Public
 */
export const loginUser = async (
  req: Request<{}, {}, LoginUserDto>,
  res: Response
) => {
  try {
    // Delegate to authService for business logic
    const token = await authService.login(req.body);
    console.log("User logged in. Token:", token);

    // Set the JWT as an HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({ message: "Logged in successfully!" });
  } catch (error: any) {
    console.error("Login error:", error.message);
    // Handle specific custom errors from service layer
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message, code: error.code });
      return;
    }
    if (error instanceof AuthenticationError) {
      res.status(401).json({ message: error.message, code: error.code });
      return;
    }
    res.status(500).json({
      message: "Server error during login.",
      code: ErrorCodes.SERVER_ERROR,
    });
  }
};

/**
 * @description Logs out the user by clearing the HttpOnly cookie.
 * @access Private (requires JWT to ensure a user is logged in to log out)
 */
export const logoutUser = (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  res.json({ message: "Logged out successfully!" });
};
