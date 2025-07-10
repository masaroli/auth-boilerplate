import Joi from "joi";
import { RegisterUserDto, LoginUserDto } from "../dtos/auth.dto";

// Joi schema for user registration validation
export const registerUserSchema = Joi.object<RegisterUserDto>({
  fullName: Joi.string().min(3).max(80).required().messages({
    "string.min": "Full name must be at least 3 characters long.",
    "string.max": "Full name cannot exceed 80 characters.",
    "string.empty": "Full name is required.",
    "any.required": "Full name is required.",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email format.",
      "string.empty": "Email is required.",
      "any.required": "Email is required.",
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("(?=.*[A-Z])")) // At least one uppercase letter
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must contain at least one uppercase letter.",
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
    }),
  role: Joi.string().valid("user", "admin").required().messages({
    "any.only": 'Role must be either "user" or "admin".',
    "string.empty": "Role is required.",
    "any.required": "Role is required.",
  }),
});

// Joi schema for user login validation
export const loginUserSchema = Joi.object<LoginUserDto>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email format.",
      "string.empty": "Email is required.",
      "any.required": "Email is required.",
    }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
});
