"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import {
  PlusIcon,
  HouseIcon,
  ChartBarIcon,
  UserIcon,
} from "@phosphor-icons/react"
import Link from "next/link"
import { getUserDashboardData } from "@/app/actions/user"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import React from "react"

import { useQuery } from "@tanstack/react-query"
import type { Rental, User, Room } from "@/db/schemas"
import Image from "next/image"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

type IncomingRental = Rental & {
  user: User
  room: Room
}

const columns: ColumnDef<IncomingRental>[] = [
  {
    accessorKey: "user",
    header: "Tenant",
    cell: ({ row }) => {
      const user = row.original.user
      return (
        <div className="flex flex-col">
          <span className="font-medium text-xs">{user.name}</span>
          <span className="text-[10px] text-muted-foreground">{user.email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "room.title",
    header: "Room",
    cell: ({ row }) => (
      <span className="text-xs font-medium">{row.original.room.title}</span>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-xs">
        {new Date(row.original.startDate).toLocaleDateString()}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-right">Status</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Badge variant="secondary" className="text-[10px] h-5">
          Active
        </Badge>
      </div>
    ),
  },
]

export default function LandlordPage() {
  const { data: session, isPending: isSessionPending } = authClient.useSession()

  const { data, isLoading } = useQuery({
    queryKey: ["landlord-dashboard"],
    queryFn: getUserDashboardData,
    enabled: !!session && session.user.role === "landlord",
  })

  if (isSessionPending || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="animate-pulse text-sm text-muted-foreground">
          Loading landlord dashboard...
        </p>
      </div>
    )
  }

  if (!session || session.user.role !== "landlord")
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Access Denied: Landlords only</p>
      </div>
    )

  return (
    <section className="mt-4">
      <div className="mx-auto max-w-4xl p-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage your properties and rentals
            </p>
          </div>
          <Button className="cursor-pointer shadow-lg shadow-primary/20">
            <Link href="/new" className="flex items-center gap-2">
              <PlusIcon weight="bold" />
              Post New Room
            </Link>
          </Button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="border-primary/10 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Total Listings</CardTitle>
              <HouseIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.rooms?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Pending Approvals</CardTitle>
              <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.rooms?.filter((r: Room) => r.status === "pending")
                  .length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Occupied Rooms</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.incomingRentals?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <div className="mt-4">
            <DataTable columns={columns} data={data?.incomingRentals || []} />
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-lg">Your Properties</h2>
          <div className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data?.rooms?.map((room: Room) => (
                <Card key={room.id}>
                  <CardHeader>
                    <div className="aspect-video w-full overflow-hidden">
                      {room.image ? (
                        <Image
                          height={400}
                          width={600}
                          src={room.image.split(",")[0]}
                          alt={room.title || "No title"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <HouseIcon
                            size={32}
                            className="text-muted-foreground/20"
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <CardTitle className="line-clamp-1 font-semibold">
                        {room.title}
                      </CardTitle>
                      <Badge
                        className={
                          room.status === "pending"
                            ? "bg-yellow-500/80 text-yellow-500"
                            : "bg-green-400/70 text-green-200"
                        }
                      >
                        {room.status}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1 line-clamp-2">
                      {room.description}
                    </CardDescription>

                    <p className="mt-2 text-red-400">₹{room.rent}/month</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-1/2 cursor-pointer">
                      Edit
                    </Button>
                    <Button variant="outline" className="w-1/2 cursor-pointer">
                      View
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {!isLoading && data?.rooms?.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                  <HouseIcon
                    size={48}
                    className="mb-4 text-muted-foreground/20"
                  />
                  <p className="text-muted-foreground italic">
                    You havent posted any rooms yet.
                  </p>
                  <Button variant="link" className="mt-2">
                    <Link href="/new">Create your first listing</Link>
                  </Button>
                </div>
              )}
              {isLoading && (
                <p className="col-span-full text-center text-muted-foreground">
                  Loading listings...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
