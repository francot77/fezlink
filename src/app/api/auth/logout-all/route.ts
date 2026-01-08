/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/user';

export async function POST(req: Request) {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Increment tokenVersion to invalidate all existing sessions (including current one)
    // The current session will be invalidated on the next request/check
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });

    return NextResponse.json({ message: 'All sessions invalidated successfully' });
  } catch (error) {
    console.error('Logout all error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
