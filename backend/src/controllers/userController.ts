import { Request, Response } from "express";

import * as authService from "../services/authService";
import * as userService from "../services/userService";
import { NotFoundError, ValidationError } from "../utils/errors";
import { UserRole } from "../types/userRoles";
import { ResetPasswordDto } from "../dtos/auth.dto";

/**
 * @description Returns the profile of the authenticated user.
 * @access Private (requires JWT)
 */
export const getProfile = (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }
  const userProfile = authService.getProfileData(
    req.user.id,
    req.user.fullName,
    req.user.email,
    req.user.roles
  );
  res.json({
    message: "Welcome to your profile",
    user: userProfile,
  });
};

/**
 * @description Returns data accessible only by admin users.
 * @access Private (requires JWT and 'admin' role)
 */
export const getAdminData = async (req: Request, res: Response) => {
  const allUsers = await userService.getAllUsers();

  res.json({
    message: "This is sensitive admin data!",
    data: {
      totalUsers: allUsers.length,
      activeSessions: "N/A (stateless JWT)",
      serverStatus: "Operational",
    },
  });
};

/**
 * @description Returns data accessible by any authenticated user.
 * @access Private (requires JWT and 'user' or 'admin' role)
 */
export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const userId = req.params.id;
    const userProfile = await userService.getUserProfileById(userId);

    if (!userProfile) {
      throw new NotFoundError(`User with ID ${userId} not found.`);
    }
    res.status(200).json({
      message: "User data retrieved successfully!",
      data: userProfile,
    });
  } catch (error: any) {
    console.error(
      `Error in getUserById for ID ${req.params.id}:`,
      error.message
    );
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Server error retrieving user data." });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    // The authorizeRoles middleware should have handled the admin check
    const users = await userService.getAllUsers();
    res.status(200).json({
      message: "All users retrieved successfully!",
      data: users,
      count: users.length,
    });
  } catch (error: any) {
    console.error("Error in getAllUsersController:", error.message);
    res.status(500).json({ message: "Server error retrieving all users." });
  }
};

/**
 * @description Allows an admin to reset another user's password.
 * @access Private (Admin Only)
 */
export const resetPassword = async (
  req: Request<{ id: string }, {}, ResetPasswordDto>,
  res: Response
) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({ message: "Invalid user ID provided." });
      return;
    }

    // Delegate to authService for password reset logic and validation
    await userService.resetPassword(userId, req.body);
    res
      .status(200)
      .json({ message: `Password for user ID ${userId} reset successfully.` });
  } catch (error: any) {
    console.error("Password reset error:", error.message);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message, code: error.code });
      return;
    }
    // If the user is not found, authService throws a generic Error
    if (
      error.message.includes("User with ID") &&
      error.message.includes("not found")
    ) {
      res.status(404).json({ message: error.message, code: error.code });
      return;
    }
    res.status(500).json({ message: "Server error during password reset." });
  }
};

/**
 * Handles the deletion of a user.
 * Requires authentication and typically an 'admin' role or the user deleting their own account.
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const userIdToDelete = req.params.id; // Get the user ID from URL parameters

    if (!req.user || !req.user.roles.includes(UserRole.ADMIN)) {
      res
        .status(403)
        .json({ message: "Forbidden: Admin access required to delete users." });
      return;
    }
    // --- End Authorization Check ---

    await userService.deleteUser(userIdToDelete);
    res.status(200).json({
      message: `User with ID ${userIdToDelete} deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Delete user error:", error.message);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Server error during user deletion." });
  }
};
