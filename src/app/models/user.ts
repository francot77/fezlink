// src/app/models/user.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  tokenVersion: number;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  isVerified: boolean;
  accountType: 'free' | 'premium';
  premiumExpiresAt?: number;
  apiKeys?: {
    key: string;
    name: string;
    createdAt: Date;
    lastUsed?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    twoFactorSecret: {
      type: String,
      required: false,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    premiumExpiresAt: {
      type: Number,
      required: false,
    },
    apiKeys: [
      {
        key: { type: String, required: true },
        name: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        lastUsed: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
  }
);



export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
