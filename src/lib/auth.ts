import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const client = new MongoClient(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
);
const db = client.db(process.env.MONGODB_DB || "loome");
const googleClientId =
  process.env.GOOGLE_CLIENTID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret =
  process.env.GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "loome-local-development-secret-change-me",
  database: mongodbAdapter(db, { client }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      appRole: {
        type: "string",
        required: false,
        defaultValue: "designer",
        input: false,
      },
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined,
  session: {
    cookieCache: { enabled: true, strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  },
  plugins: [jwt()],
});
