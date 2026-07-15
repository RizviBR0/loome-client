import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");

const globalMongo = globalThis as typeof globalThis & { __loomeMongo?: MongoClient };
export const mongo = globalMongo.__loomeMongo ?? new MongoClient(uri);
if (process.env.NODE_ENV !== "production") globalMongo.__loomeMongo = mongo;
export const loomeDb = mongo.db(process.env.MONGODB_DB || "loome");
