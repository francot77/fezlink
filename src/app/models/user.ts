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
  language: 'es' | 'en';
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  lastVerificationEmailSent?: Date;
  accountType: 'free' | 'starter' | 'pro';
  premiumExpiresAt?: number;
  // Paddle Fields
  subscriptionId?: string;
  customerId?: string;
  subscriptionStatus?: 'active' | 'past_due' | 'paused' | 'canceled' | 'trialing';
  nextBillDate?: Date;
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
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },
    lastVerificationEmailSent: {
      type: Date,
      required: false,
    },
    accountType: {
      type: String,
      enum: ['free', 'starter', 'pro'],
      default: 'free',
    },
    premiumExpiresAt: {
      type: Number,
      required: false,
    },
    // Paddle Subscription Fields
    subscriptionId: {
      type: String,
      required: false,
    },
    customerId: {
      type: String,
      required: false,
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'past_due', 'paused', 'canceled', 'trialing'],
      required: false,
    },
    nextBillDate: {
      type: Date,
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
