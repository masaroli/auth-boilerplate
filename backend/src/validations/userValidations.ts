import Joi from "joi";
import { ResetPasswordDto } from "../dtos/auth.dto";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const userIdSchema = Joi.string()
  .pattern(objectIdRegex)
  .required()
  .messages({
    "string.pattern.base": "Invalid user ID format.",
    "string.empty": "User ID cannot be empty.",
    "any.required": "User ID is required.",
  });

// Joi schema for admin-initiated password reset
export const resetPasswordSchema = Joi.object<ResetPasswordDto>({
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp("(?=.*[A-Z])")) // At least one uppercase letter
    .required()
    .messages({
      "string.min": "New password must be at least 8 characters long.",
      "string.pattern.base":
        "New password must contain at least one uppercase letter.",
      "string.empty": "New password is required.",
      "any.required": "New password is required.",
    }),
});
