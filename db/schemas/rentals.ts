import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./user"
import { rooms } from "./rooms"

export const rentals = pgTable("rentals", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type Rental = typeof rentals.$inferSelect
export type NewRental = typeof rentals.$inferInsert
