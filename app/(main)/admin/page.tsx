"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { HouseIcon, UsersIcon, CheckCircleIcon } from "@phosphor-icons/react"
import React from "react"
import { getAdminDashboardData } from "@/app/actions/user"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Room, User } from "@/db/schemas"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  updateRoomStatusAction,
  updateUserRoleAction,
} from "@/app/actions/user"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export default function AdminPage() {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()

  // Fetch Dashboard Data
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboardData,
    enabled: !!session && session.user.role === "admin",
  })

  // Room Status Mutation
  const updateRoomStatus = useMutation({
    mutationFn: async ({
      roomId,
      status,
    }: {
      roomId: string
      status: "approved" | "rejected" | "pending"
    }) => {
      const res = await updateRoomStatusAction(roomId, status)
      if (!res.success)
        throw new Error(res.error || "Failed to update room status")
      return res
    },
    onSuccess: () => {
      toast.success("Room status updated successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })
      setSelectedRoom(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // User Role Mutation
  const updateUserRole = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string
      role: "user" | "landlord" | "admin"
    }) => {
      const res = await updateUserRoleAction(userId, role)
      if (!res.success)
        throw new Error(res.error || "Failed to update user role")
      return res
    },
    onSuccess: (_, { role }) => {
      toast.success(`User role updated to ${role}`)
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })
      setSelectedUser(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Dialog State
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)

  if (!session || session.user.role !== "admin")
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Unauthorized Access</p>
      </div>
    )

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="animate-pulse text-sm text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    )
  }

  return (
    <section className="mt-4">
      <div className="mx-auto max-w-4xl p-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <HouseIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.rooms?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.users?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approvals
              </CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.rooms?.filter((r) => r.status === "pending").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Title
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Landlord
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {data?.rooms?.map((room) => (
                        <tr
                          key={room.id}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle font-medium">
                            {room.title}
                          </td>
                          <td className="p-4 align-middle">
                            {room.author?.name || "Unknown"}
                          </td>
                          <td className="p-4 align-middle">
                            <Badge
                              className={
                                room.status === "approved"
                                  ? "bg-green-500"
                                  : room.status === "pending"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }
                            >
                              {room.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-right align-middle">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRoom(room)}
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Name
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Email
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Role
                        </th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {data?.users?.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle font-medium">
                            {user.name}
                          </td>
                          <td className="p-4 align-middle">{user.email}</td>
                          <td className="p-4 align-middle">
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-right align-middle">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Room Status Dialog */}
        <Dialog
          open={!!selectedRoom}
          onOpenChange={(open) => !open && setSelectedRoom(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Room Status</DialogTitle>
              <DialogDescription>
                Update the status for {selectedRoom?.title}. This will affect
                its visibility on the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <label className="mb-2 block text-sm font-medium">Status</label>
              <Select
                value={selectedRoom?.status}
                onValueChange={(val) =>
                  updateRoomStatus.mutate({
                    roomId: selectedRoom!.id,
                    status: val as "approved" | "rejected" | "pending",
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedRoom(null)}
                disabled={updateRoomStatus.isPending}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Role Dialog */}
        <Dialog
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>
                Change the access level for {selectedUser?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <label className="mb-2 block text-sm font-medium">Role</label>
              <Select
                value={selectedUser?.role || "user"}
                onValueChange={(val) =>
                  updateUserRole.mutate({
                    userId: selectedUser!.id,
                    role: val as "user" | "landlord" | "admin",
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
                disabled={updateUserRole.isPending}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
