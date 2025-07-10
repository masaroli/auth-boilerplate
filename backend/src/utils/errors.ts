import { ErrorCodes } from "../types/errorCodes";

export class ValidationError extends Error {
  public code: string;
  constructor(message: string, code: string = ErrorCodes.VALIDATION_ERROR) {
    // Use enum default
    super(message);
    this.name = "ValidationError";
    this.code = code;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Custom error class for authentication failures (e.g., invalid credentials).
 */
export class AuthenticationError extends Error {
  public code: string;
  constructor(message: string, code: string = ErrorCodes.AUTHENTICATION_ERROR) {
    // Use enum default
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Custom error class for authorization failures (e.g., insufficient permissions).
 */
export class AuthorizationError extends Error {
  public code: string;
  constructor(message: string, code: string = ErrorCodes.AUTHORIZATION_ERROR) {
    // Use enum default
    super(message);
    this.name = "AuthorizationError";
    this.code = code;
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Custom error class for conflict errors (e.g., resource already exists).
 */
export class ConflictError extends Error {
  public code: string;
  constructor(message: string, code: string = ErrorCodes.CONFLICT_ERROR) {
    // Use enum default
    super(message);
    this.name = "ConflictError";
    this.code = code;
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Custom error class for resource not found errors.
 */
export class NotFoundError extends Error {
  public code: string;
  constructor(message: string, code: string = ErrorCodes.NOT_FOUND_ERROR) {
    // Use enum default
    super(message);
    this.name = "NotFoundError";
    this.code = code;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
