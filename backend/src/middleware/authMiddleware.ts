import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { AuthorizationError } from "../utils/errors";

/**
 * Middleware to verify JWT from the Authorization header.
 * Attaches decoded user payload to `req.user`.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // 1. Try to get token from HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token == null) {
    res.status(401).json({ message: "No token provided. Access denied." });
    return;
  }

  // Verify the token
  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      // Token is invalid or expired
      console.error("JWT verification error:", err.message);
      res
        .status(403)
        .json({ message: "Invalid or expired token. Access forbidden." });
      return;
    }
    // If token is valid, attach the decoded user payload to the request object
    req.user = user as {
      id: string;
      fullName: string;
      email: string;
      roles: string[];
    };
    next();
  });
};

/**
 * Middleware to check if the authenticated user has any of the required roles.
 * @param {string[]} requiredRoles - An array of roles that are allowed to access the route.
 */
export const authorizeRoles = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure req.user exists (meaning authenticateToken middleware ran successfully)
    if (!req.user || !req.user.roles) {
      // This case should ideally be caught by authenticateToken, but good for robustness
      res
        .status(403)
        .json({ message: "User roles not found. Access forbidden." });
      return;
    }

    // Check if the user's roles include any of the required roles
    const hasPermission = requiredRoles.some((role) =>
      req.user!.roles.includes(role)
    ); // Use non-null assertion !

    if (hasPermission) {
      next(); // User has permission, proceed
    } else {
      // Throw AuthorizationError for consistent handling
      throw new AuthorizationError(
        "Insufficient permissions. Access forbidden."
      );
    }
  };
};
