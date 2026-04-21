import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const Role = pgEnum("role", ["user", "owner", "admin"])

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: Role("role").default("user").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  phoneNumber: text("phone_number").unique(),
  phoneNumberVerified: boolean("phone_number_verified"),
})

export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert
