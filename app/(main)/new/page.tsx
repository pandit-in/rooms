import { PostRoomForm } from "@/components/forms/rooms/post-room"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function NewRoomPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <section className="mx-auto mt-4 max-w-4xl">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Post a room for rent</h1>
        <p className="text-muted-foreground">
          Post a room to help others find a place to stay.
        </p>
        <div className="mt-6">
          <PostRoomForm />
        </div>
      </div>
    </section>
  )
}
