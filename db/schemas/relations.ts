import { relations } from "drizzle-orm"
import { user } from "./user"
import { session, account } from "./auth"
import { rooms } from "./rooms"
import { rentals } from "./rentals"

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  rooms: many(rooms),
  rentals: many(rentals),
}))

export const roomRelations = relations(rooms, ({ one, many }) => ({
  author: one(user, {
    fields: [rooms.createdBy],
    references: [user.id],
  }),
  rentals: many(rentals),
}))

export const rentalRelations = relations(rentals, ({ one }) => ({
  user: one(user, {
    fields: [rentals.userId],
    references: [user.id],
  }),
  room: one(rooms, {
    fields: [rentals.roomId],
    references: [rooms.id],
  }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))
