import { expo } from "@better-auth/expo";
import { db } from "@rooms/db";
import * as schema from "@rooms/db/schema/auth";
import { env } from "@rooms/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [
    ...env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    "rooms://",
    ...(env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**", "http://localhost:8081"]
      : []),
  ],
  emailAndPassword: {
    enabled: true,
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: env.NODE_ENV === "development" ? "lax" : "none",
      secure: env.NODE_ENV !== "development",
      httpOnly: true,
    },
  },
  plugins: [expo()],
});
