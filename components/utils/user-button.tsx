import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import {
  CaretDownIcon,
  GearIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react"
import { authClient } from "@/lib/auth-client"
import { type SessionWithUser } from "@/db/schemas"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"

export default function UserButton({ session }: { session: SessionWithUser }) {
  const { user } = session
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant={"ghost"} className="cursor-pointer" />}
        >
          <div className="flex items-center gap-x-2">
            <CaretDownIcon />
            <Avatar className="size-7">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{user.name || "User"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.role === "admin" && (
              <DropdownMenuItem>
                <Link
                  href="/admin"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </DropdownMenuItem>
            )}
            {user.role === "landlord" && (
              <DropdownMenuItem>
                <Link
                  href="/landlord"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Landlord</span>
                </Link>
              </DropdownMenuItem>
            )}
            {user.role === "tenant" && (
              <DropdownMenuItem>
                <Link
                  href="/tenant"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Tenant</span>
                </Link>
              </DropdownMenuItem>
            )}
            {user.role === "user" && (
              <DropdownMenuItem>
                <Link
                  href="/profile"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem>
              <Link
                href="/settings"
                className="flex cursor-pointer items-center gap-2"
              >
                <GearIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => authClient.signOut()}
            >
              <SignOutIcon className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
