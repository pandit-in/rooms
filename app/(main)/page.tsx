import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RoomFeed } from "@/components/rooms/room-feed"

export default function Page() {
  return (
    <div className="mx-auto mt-6 max-w-4xl p-4 md:mt-12">
      <section>
        <h1 className="text-xl font-bold md:text-4xl">
          Find rooms & PG&apos;s near you
        </h1>
        <p className="mb-2 text-sm text-muted-foreground md:mb-5 md:text-base">
          Search through thousands of verified rooms and PGs for rent across
          your city.
        </p>

        <div className="pt-2 md:pt-4">
          <form className="flex w-full items-center gap-x-2" action="">
            <Input
              type="text"
              className="flex-1"
              placeholder="Search for a location..."
            />
            <Button>Search</Button>
          </form>
        </div>

        <RoomFeed />
      </section>
    </div>
  )
}
