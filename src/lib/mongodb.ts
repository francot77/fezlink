/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/mongodb.js
import Biopage from '@/app/models/bioPages';
import mongoose from 'mongoose';
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}
/** 
 * Cached connection for MongoDB.
 */
type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
let cached: MongooseCache = global.mongoose as MongooseCache;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {


    if (cached!.conn) {
        return cached!.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI!, {
            dbName: 'fezlink'
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
export async function updateAvatarUrl(userId: string, avatarUrl: string) {
    await dbConnect();

    const result = await Biopage.updateOne(
        { userId },
        { $set: { avatarUrl } }
    );

    if (result.matchedCount === 0) {
        throw new Error("Biopage no encontrado para el userId dado");
    }
}

export default dbConnect;