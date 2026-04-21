import { pgEnum, pgTable, text, integer, timestamp } from "drizzle-orm/pg-core"

export const sharingType = pgEnum("sharing_type", [
  "single",
  "double",
  "triple",
  "quad",
])
export const roomStatus = pgEnum("room_status", [
  "pending",
  "approved",
  "rejected",
])
export const verifiedStatus = pgEnum("verified_status", ["true", "false"])
export const ownerStatus = pgEnum("owner_status", ["true", "false"])

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  image: text("image"),
  rent: integer("rent"),
  deposit: integer("deposit"),
  location: text("location"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  sharingType: sharingType("sharing_type"),
  amenities: text("amenities"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactAddress: text("contact_address"),
  createdBy: text("created_by"),
  status: roomStatus("room_status").default("pending"),
  isVerified: verifiedStatus("verified_status").default("false"),
  isOwnerListing: ownerStatus("owner_status").default("false"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
})

export type Room = typeof rooms.$inferSelect
export type NewRoom = typeof rooms.$inferInsert
