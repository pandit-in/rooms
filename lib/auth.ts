import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "@/db/schemas"
import { admin } from "better-auth/plugins"

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), {
  schema,
})

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    const url = process.env.BETTER_AUTH_URL;
    if (url && !url.includes("localhost")) {
      return url;
    }
    return "https://rooms.shadospace.in";
  }
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
};

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  baseURL: getBaseURL(),
  trustedOrigins: ["https://rooms.shadospace.in"],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    admin({
      adminUserIds: ["867awqU25oJ2J4jBbgio8rZny3Zvd70l"], // [!code highlight]
    }),
  ],
})
