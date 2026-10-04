"use server"

import { auth } from "@/lib/auth"
import { db } from "@/db"
import { rooms, rentals, user as userTable } from "@/db/schemas"
import { eq, inArray } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function onboardingAction(
  role: "user" | "tenant" | "landlord" | "admin"
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      throw new Error("Unauthorized")
    }

    const userId = session.user.id

    const user = await db.query.user.findFirst({
      where: eq(userTable.id, userId),
    })

    if (!user) {
      throw new Error("User not found")
    }
    await db.update(userTable).set({ role }).where(eq(userTable.id, userId))

    return {
      success: true,
      role,
    }
  } catch (error) {
    const e = error as Error
    return {
      success: false,
      error: e.message,
    }
  }
}

export async function getUserDashboardData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  const userId = session.user.id

  const userRentals = await db.query.rentals.findMany({
    where: eq(rentals.userId, userId),
    with: {
      room: true,
    },
  })

  const userRooms = await db.query.rooms.findMany({
    where: eq(rooms.createdBy, userId),
  })

  // Fetch rentals for the rooms owned by the user (as a landlord)
  const incomingRentals =
    userRooms.length > 0
      ? await db.query.rentals.findMany({
          where: inArray(
            rentals.roomId,
            userRooms.map((room) => room.id)
          ),
          with: {
            user: true,
            room: true,
          },
        })
      : []

  return {
    user: session.user,
    rentals: userRentals,
    rooms: userRooms,
    incomingRentals,
    isTenant: userRentals.length > 0,
  }
}

export async function getAdminDashboardData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const allRooms = await db.query.rooms.findMany({
    with: {
      author: true,
    },
  })

  const allUsers = await db.query.user.findMany()

  return {
    rooms: allRooms,
    users: allUsers,
  }
}

export async function updateRoomStatusAction(
  roomId: string,
  status: "approved" | "rejected" | "pending"
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    await db.update(rooms).set({ status }).where(eq(rooms.id, roomId))

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateUserRoleAction(userId: string, role: "user" | "tenant" | "landlord" | "admin") {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    await db.update(userTable).set({ role }).where(eq(userTable.id, userId))

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: (error as Error).message }
  }
}
