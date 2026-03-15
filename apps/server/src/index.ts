import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@rooms/api/context";
import { appRouter } from "@rooms/api/routers/index";
import { auth } from "@rooms/auth";
import { env } from "@rooms/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { handle } from "hono/vercel";

const app = new Hono();

app.use(logger());
const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());

app.use(
  "/*",
  cors({
    origin: (origin) => {
      return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);

export default app;
