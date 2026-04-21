"use client"

import Image from "next/image"
import Link from "next/link"
import React from "react"
import { Button } from "../ui/button"
import { UserCircleIcon } from "@phosphor-icons/react"
import { authClient } from "@/lib/auth-client"

export default function Header() {
  const { data: session } = authClient.useSession()
  return (
    <header className="w-full border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href={"/"} className="flex items-center gap-x-2">
          <Image src="/logo.png" alt="Logo" width={25} height={25} />
          <h1 className="text-xl font-bold">rooms</h1>
        </Link>
        <div className="flex items-center gap-x-2">
          {session ? (
            <Button variant={"ghost"}>
              <Link href={"/profile"} className="flex items-center gap-x-2">
                <UserCircleIcon size={20} />
                {session.user?.name || "User"}
              </Link>
            </Button>
          ) : (
            <Button variant={"ghost"}>
              <Link href={"/sign-in"} className="flex items-center gap-x-2">
                <UserCircleIcon size={20} />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
