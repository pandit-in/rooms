"use server"

import { db } from "@/db"
import { rooms, rentals } from "@/db/schemas"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { formSchema } from "@/components/forms/rooms/post-room"
import { eq } from "drizzle-orm"

export async function createRoomAction(data: z.infer<typeof formSchema>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return { error: "You must be logged in to post a room." }
    }

    const roomId = crypto.randomUUID()

    await db.insert(rooms).values({
      id: roomId,
      title: data.title,
      description: data.description,
      image: data.image ? data.image.join(",") : "",
      rent: Number(data.rent),
      deposit: Number(data.deposit),
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      sharingType: data.sharingType,
      amenities: data.amenities ? data.amenities.join(",") : "",
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      createdBy: session.user.id,
      status: "pending",
      isVerified: "false",
      isOwnerListing: "false",
      contactAddress: data.address,
    })

    revalidatePath("/")
    return { success: true, roomId }
  } catch (error) {
    console.error("Failed to create room:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function getRoomsAction() {
  try {
    const allRooms = await db.select().from(rooms).orderBy(rooms.createdAt)
    return { success: true, rooms: allRooms.reverse() }
  } catch (error) {
    console.error("Failed to fetch rooms:", error)
    return { error: "Failed to fetch rooms." }
  }
}

export async function bookRoomAction(roomId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return { error: "You must be logged in to book a room." }
    }

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    })

    if (!room) {
      return { error: "Room not found." }
    }

    if (room.createdBy === session.user.id) {
      return { error: "You cannot book your own room." }
    }

    const existingRental = await db.query.rentals.findFirst({
      where: eq(rentals.roomId, roomId),
    })

    if (existingRental) {
      return { error: "This room is already rented." }
    }

    await db.insert(rentals).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      roomId: roomId,
    })

    revalidatePath("/profile")
    revalidatePath(`/room/${roomId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to book room:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
