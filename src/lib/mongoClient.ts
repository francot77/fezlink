// src/lib/mongoClient.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    // @ts-expect-error: global._mongoClientPromise is not typed
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        // @ts-expect-error: global._mongoClientPromise is not typed
        global._mongoClientPromise = client.connect();
    }
    // @ts-expect-error: global._mongoClientPromise is not typed
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
