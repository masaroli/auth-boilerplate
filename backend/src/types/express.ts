import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        fullName: string;
        email: string;
        roles: string[];
      };
    }
  }
}

export {};
