// src/app/models/user.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
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

// Índices para búsquedas rápidas
/* UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 }); */

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
