import bcrypt from "bcryptjs/umd/types";
import mongoose from "mongoose";

import config from "../config";
import { ResetPasswordDto, UserProfileDto } from "../dtos/auth.dto";
import { NotFoundError, ValidationError } from "../utils/errors";
import { ErrorCodes } from "../types/errorCodes";
import {
  resetPasswordSchema,
  userIdSchema,
} from "../validations/userValidations";
import UserModel from "../models/User/User";

/**
 * Retrieves all users from the database, excluding sensitive information like password hashes.
 * Maps the Mongoose documents to UserProfileDto.
 * @returns A Promise that resolves to an array of UserProfileDto.
 * @throws Error for unexpected database issues.
 */
export const getAllUsers = async (): Promise<UserProfileDto[]> => {
  try {
    // Use UserModel.find() to get all documents.
    // .select('-passwordHash') ensures the passwordHash field is excluded from the results.
    const users = await UserModel.find().select("-passwordHash");

    // Map the Mongoose documents to your UserProfileDto format
    return users.map((user) => ({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      roles: user.roles,
    }));
  } catch (error: any) {
    console.error("Error in userService.getAllUsers:", error.message);
    // Re-throw a generic server error to the controller
    throw new Error("Failed to retrieve users due to a server error.");
  }
};

/**
 * Retrieves a single user's profile by ID, excluding sensitive information.
 * @param userId The ID of the user to retrieve.
 * @returns A Promise that resolves to a UserProfileDto or null if not found.
 * @throws ValidationError if the userId format is invalid.
 * @throws Error for unexpected database issues.
 */
export const getUserProfileById = async (
  userId: string
): Promise<UserProfileDto | null> => {
  try {
    const user = await UserModel.findById(userId).select("-passwordHash");
    if (!user) {
      return null; // User not found
    }

    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      roles: user.roles,
    };
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ValidationError("Invalid user ID format.");
    }
    console.error(
      `Error in userService.getUserProfileById for ID ${userId}:`,
      error.message
    );
    throw new Error("Failed to retrieve user profile due to a server error.");
  }
};

/**
 * Allows an admin to reset another user's password.
 * @param userId - The ID of the user whose password is to be reset.
 * @param newPasswordData - Object containing the new password.
 * @returns A Promise that resolves to true if the password was successfully reset.
 * @throws ValidationError if the new password does not meet criteria.
 * @throws Error if the user is not found.
 */
export const resetPassword = async (
  userId: string,
  newPasswordData: ResetPasswordDto
): Promise<boolean> => {
  // --- Joi Validation for new password ---
  const { error } = resetPasswordSchema.validate(newPasswordData);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  // --- End Joi Validation ---

  try {
    // 1. Find the user by ID using Mongoose's findById
    // Mongoose can directly take the string userId and convert it to ObjectId
    const user = await UserModel.findById(userId); // <--- REPLACED findUserById

    if (!user) {
      // If user is not found, throw an error
      throw new Error(`User with ID ${userId} not found.`);
    }

    // 2. Hash the new password
    const newPasswordHash = await bcrypt.hash(
      newPasswordData.newPassword,
      config.BCRYPT_SALT_ROUNDS
    );

    // 3. Update the user's password hash using Mongoose's findByIdAndUpdate
    // { new: true } returns the document *after* the update
    // { runValidators: true } ensures any schema validators on the passwordHash field run (though not strictly necessary for simple updates like this)
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { passwordHash: newPasswordHash },
      { new: true, runValidators: true }
    );

    // Check if the update was successful (updatedUser will be null if user not found, though we checked above)
    if (!updatedUser) {
      // This case should ideally not be hit if 'user' was found,
      // but it's a good defensive check for race conditions or unexpected issues.
      throw new ValidationError(
        `Failed to update password for user ID ${userId}.`
      );
    }

    console.log(`Password updated successfully for user ID ${userId}`);
    return true; // Return true if update was successful
  } catch (error: any) {
    // Handle specific Mongoose errors here if needed
    if (error instanceof mongoose.Error.CastError) {
      // This error occurs if userId is not a valid MongoDB ObjectId format
      console.error(`Invalid User ID: ${userId}`, error);
      throw new ValidationError(`Invalid user ID format.`);
    }
    console.error(
      `Error in resetUserPassword for user ID ${userId}:`,
      error.message
    );
    throw error;
  }
};

/**
 * Deletes a user from the database by their ID.
 * @param userId The ID of the user to delete.
 * @returns A boolean indicating if the user was successfully deleted.
 * @throws NotFoundError if the user does not exist.
 * @throws ValidationError if the userId format is invalid.
 * @throws Error for other unexpected database errors.
 */

export const deleteUser = async (userId: string): Promise<boolean> => {
  // --- Joi Validation for userId ---
  const { error } = userIdSchema.validate(userId); // Validate the incoming userId
  if (error) {
    throw new ValidationError(
      error.details[0].message,
      ErrorCodes.INVALID_USER_ID_FORMAT
    );
  }
  // --- End Joi Validation ---

  try {
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new NotFoundError(
        `User with ID ${userId} not found.`,
        ErrorCodes.USER_NOT_FOUND
      );
    }

    console.log(`User with ID ${userId} deleted successfully.`);
    return true; // Indicate successful deletion
  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error; // Re-throw custom errors already handled
    }
    console.error(`Error deleting user with ID ${userId}:`, error.message);
    throw new Error(`Server error during user deletion for ID ${userId}.`);
  }
};
