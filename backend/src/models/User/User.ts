import mongoose, { Schema } from "mongoose";
import { UserSchema } from "./interfaces";

// 2. Define the Mongoose Schema
const UserSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required."],
    },
    roles: {
      type: [String],
      default: ["user"],
      enum: ["user", "admin", "client"],
    },
  },
  {
    timestamps: true,
  }
);

// 3. Create and Export the Mongoose Model (remains the same)
const UserModel = mongoose.model<UserSchema>("User", UserSchema);

export default UserModel;
