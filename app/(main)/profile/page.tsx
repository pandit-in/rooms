"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { PlusIcon } from "@phosphor-icons/react"
import Link from "next/link"
export default function ProfilePage() {
  const { data: session } = authClient.useSession()
  return (
    <section className="mt-4">
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center gap-x-4">
          <Avatar className="size-16">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>{session?.user?.name || "User"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <p className="text-lg font-semibold">
              {session?.user?.name || "User"}
            </p>
            <p className="text-sm text-muted-foreground">
              {session?.user?.email}
            </p>
            <p className="text-sm text-muted-foreground">My Listings: 0</p>
          </div>
        </div>
        <div className="mt-10 flex items-center gap-x-2">
          <Button className="cursor-pointer" variant={"secondary"}>
            <Link href={"/new"} className="flex items-center gap-x-1">
              <PlusIcon />
              Post a Room
            </Link>
          </Button>
          <Button variant={"destructive"}>Logout</Button>
        </div>
      </div>
    </section>
  )
}
