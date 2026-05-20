"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import { UserCircleIcon } from "@phosphor-icons/react"
import { authClient } from "@/lib/auth-client"
import UserButton from "../utils/user-button"
import { SessionWithUser } from "@/db/schemas"
import { Skeleton } from "../ui/skeleton"

export default function Header() {
  const { data: session, isPending } = authClient.useSession()
  return (
    <header className="w-full border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href={"/"} className="flex items-center gap-x-2">
          <Image src="/logo.png" alt="Logo" width={25} height={25} />
          <h1 className="text-xl font-bold">rooms</h1>
        </Link>
        <div className="flex items-center gap-x-2">
          {session ? (
            <UserButton session={session as SessionWithUser} />
          ) : isPending ? (
            <Skeleton className="size-7 rounded-full" />
          ) : (
            <Button variant={"ghost"}>
              <Link href={"/signup"} className="flex items-center gap-x-2">
                <UserCircleIcon size={20} />
                Sign Up
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
