"use client"

import React, { useEffect, useState } from "react"
import { getRoomsAction } from "@/app/actions/room.actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Room } from "@/db/schemas"
import Image from "next/image"
import Link from "next/link"
import { UserCircleIcon } from "@phosphor-icons/react"

function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

type RoomWithDistance = Room & { distance?: number }

export function RoomFeed() {
  const [rooms, setRooms] = useState<RoomWithDistance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [locationStatus, setLocationStatus] = useState<
    "pending" | "granted" | "denied"
  >("pending")

  const askForLocation = (initialRooms: RoomWithDistance[]) => {
    if (!navigator.geolocation) {
      setLocationStatus("denied")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus("granted")
        const { latitude, longitude } = pos.coords

        const sorted = [...initialRooms]
          .map((room) => {
            if (!room.latitude || !room.longitude) return room
            const dist = getDistanceInKm(
              latitude,
              longitude,
              parseFloat(room.latitude),
              parseFloat(room.longitude)
            )
            return { ...room, distance: dist }
          })
          .sort((a, b) => {
            if (a.distance === undefined) return 1
            if (b.distance === undefined) return -1
            return a.distance - b.distance
          })

        setRooms(sorted)
      },
      () => {
        setLocationStatus("denied")
      }
    )
  }

  useEffect(() => {
    async function loadRooms() {
      setIsLoading(true)
      const res = await getRoomsAction()
      if (res.success && res.rooms) {
        setRooms(res.rooms)
      }
      setIsLoading(false)
      askForLocation(res.rooms || [])
    }
    loadRooms()
  }, [])


  if (isLoading) {
    return (
      <div className="animate-pulse py-10 text-center text-muted-foreground">
        Loading nearby rooms...
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        No rooms found. Be the first to post!
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6 pt-8">
      {locationStatus === "granted" && (
        <div className="inline-flex items-center gap-2 self-start rounded-md border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Showing rooms nearest to your location
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          const firstImage = room.image ? room.image.split(",")[0] : null

          return (
            <Card key={room.id} className="overflow-hidden">
              <Link href={`/room/${room.id}`}>
                <CardHeader>
                  <div className="relative">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={room.title || "Room"}
                        height={480}
                        width={720}
                        quality={50}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 right-2 rounded bg-background/90 px-2 py-1 text-xs font-bold shadow-sm backdrop-blur-sm">
                      {room.rent}/mo
                    </div>
                  </div>
                </CardHeader>
              </Link>
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1" title={room.title || ""}>
                    {room.title}
                  </CardTitle>
                  {room.distance !== undefined && (
                    <span className="text-xs">
                      {room.distance < 1
                        ? `${(room.distance * 1000).toFixed(0)}m away`
                        : `${room.distance.toFixed(1)}km away`}
                    </span>
                  )}
                </div>

                <CardDescription
                  className="mt-1 line-clamp-2"
                  title={room.contactAddress || room.location || ""}
                >
                  {room.contactAddress || room.location}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-1">
                  <span className="flex items-center gap-1 text-xs capitalize">
                    <UserCircleIcon />
                    {room.sharingType} Sharing
                  </span>
                  {/* <span className="flex flex-wrap gap-1">
                    {room.amenities &&
                      room.amenities
                        .split(",")
                        .slice(0, 2)
                        .map((amenity, i) => (
                          <span key={i} className="border text-xs">
                            {amenity}
                          </span>
                        ))}
                    {room.amenities && room.amenities.split(",").length > 2 && (
                      <span className="text-xs">
                        +{room.amenities.split(",").length - 2} more
                      </span>
                    )}
                  </span> */}
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
