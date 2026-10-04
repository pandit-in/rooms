"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { bookRoomAction } from "@/app/actions/room"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function BookingButton({ roomId }: { roomId: string }) {
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()

  const handleBook = () => {
    startTransition(async () => {
      const res = await bookRoomAction(roomId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Room booked successfully!")
        router.push("/profile")
      }
    })
  }

  return (
    <Button
      className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
      onClick={handleBook}
      disabled={isPending}
    >
      {isPending ? "Booking..." : "Book This Room Now"}
    </Button>
  )
}
