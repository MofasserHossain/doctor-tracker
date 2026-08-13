import mongoose, { type Model } from "mongoose";

const userRoles = ["ADMIN"] as const;
export type UserRole = (typeof userRoles)[number];
const { model, models, Schema } = mongoose;

export type User = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
};

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: userRoles,
      default: "ADMIN",
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const UserModel = (models.User as Model<User> | undefined) ?? model<User>("User", userSchema);
