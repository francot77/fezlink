// src/app/models/user.ts
import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    name: String,
    image: String,
    passwordHash: String, // solo para credenciales

    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    planSince: Date,
  },
  { timestamps: true }
);

export const User = models.User || model('User', UserSchema);
