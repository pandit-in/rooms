"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { PlusIcon, HouseIcon, BedIcon } from "@phosphor-icons/react"
import Link from "next/link"
import React from "react"
import { getUserDashboardData } from "@/app/actions/user"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rental, Room } from "@/db/schemas"

interface SessionUser {
  id: string
  email: string
  name: string
  image?: string | null
  role?: string | null
}

interface DashboardData {
  user: SessionUser
  rentals: (Rental & { room: Room })[] // This tells TS that rentals HAVE rooms
  rooms: Room[]
  isTenant: boolean
}

export default function ProfilePage() {
  const { data: session } = authClient.useSession()
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getUserDashboardData().then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (!session) return null

  return (
    <section className="mt-4">
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <Avatar className="size-16 border-2 border-primary/10">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{session.user.name}</h1>
                <Badge variant="secondary" className="capitalize">
                  {data?.isTenant ? "Tenant" : session.user.role}
                </Badge>
              </div>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => authClient.signOut()}>
            Logout
          </Button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Rentals Section */}
          <Card className="border-none bg-secondary/20 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Rentals</CardTitle>
              <BedIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.rentals?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Active rentals</p>

              <div className="mt-4 space-y-3">
                {data?.rentals?.map((rental) => (
                  <div
                    key={rental.id}
                    className="flex items-center justify-between rounded-lg bg-background p-3 text-sm shadow-sm"
                  >
                    <span className="font-medium">{rental.room.title}</span>
                    <Badge variant="outline">₹{rental.room.rent}/mo</Badge>
                  </div>
                ))}
                {loading && (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                )}
                {!loading && data?.rentals?.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No active rentals found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Listings Section (if landlord) */}
          {session.user.role === "landlord" && (
            <Card className="border-none bg-primary/5 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  My Listings
                </CardTitle>
                <HouseIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.rooms?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total rooms posted
                </p>

                <div className="mt-4 space-y-3">
                  {data?.rooms?.map((room: Room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between rounded-lg bg-background p-3 text-sm shadow-sm"
                    >
                      <span className="line-clamp-1 font-medium">
                        {room.title}
                      </span>
                      <Badge
                        className={`${room.status === "approved" ? "bg-green-500" : "bg-yellow-500"}`}
                      >
                        {room.status}
                      </Badge>
                    </div>
                  ))}
                  {loading && (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  )}
                  <Button variant="ghost" size="sm" className="mt-2 w-full">
                    <Link href="/new" className="flex items-center gap-1">
                      <PlusIcon /> Post New Room
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
