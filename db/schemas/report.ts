import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  roomId: text("room_id"),
  userId: text("user_id"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
})

export type Report = typeof reports.$inferSelect
export type NewReport = typeof reports.$inferInsert
