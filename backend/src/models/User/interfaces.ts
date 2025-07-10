import mongoose, { Document } from "mongoose";

// 1. Define the TypeScript Interface for a User Document
export interface UserSchema extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  passwordHash: string;
  email: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}
