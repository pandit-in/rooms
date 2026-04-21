import { db } from "@/db"
import { rooms } from "@/db/schemas"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  MapPinIcon,
  IdentificationBadgeIcon,
  PhoneIcon,
} from "@phosphor-icons/react/dist/ssr"
import { MapWrapper } from "@/components/maps/map-wrapper"

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const roomList = await db.select().from(rooms).where(eq(rooms.id, id))

  if (!roomList.length) {
    notFound()
  }

  const room = roomList[0]
  const images = room.image ? room.image.split(",") : []
  const amenities = room.amenities ? room.amenities.split(",") : []

  return (
    <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-8 p-4 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">{room.title}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPinIcon size={20} />
          <span>{room.contactAddress || room.location}</span>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="relative w-full">
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((img, idx) => (
                <CarouselItem key={idx}>
                  <div className="relative h-[300px] w-full overflow-hidden border md:h-[500px]">
                    <Image
                      src={img}
                      alt={`${room.title} image ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </div>
      ) : (
        <div className="flex h-[300px] w-full items-center justify-center rounded-xl border bg-muted">
          No images available
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-[1fr_350px]">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">About this room</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {room.description}
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, i) => (
                <span
                  key={i}
                  className="border border-border/50 bg-muted px-4 py-2 text-sm font-medium"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Location</h2>
            {room.latitude && room.longitude ? (
              <div className="flex flex-col gap-3">
                <div className="relative z-0 h-[400px] w-full overflow-hidden">
                  <MapWrapper lat={room.latitude} lng={room.longitude} />
                </div>
                <div className="flex items-center justify-between border bg-muted/40 p-4">
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-semibold text-foreground">
                      Coordinates:
                    </span>
                    <span className="border bg-background px-2 py-0.5 font-mono">
                      {parseFloat(room.latitude).toFixed(6)},{" "}
                      {parseFloat(room.longitude).toFixed(6)}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${room.latitude},${room.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      <MapPinIcon weight="fill" size={18} />
                      Get Directions
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Exact location not provided on map.
              </p>
            )}
          </section>
        </div>

        <div className="relative">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl">
                ₹{room.rent}{" "}
                <span className="font-normal text-muted-foreground">
                  / month
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-muted/40 p-4">
                  <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Deposit
                  </span>
                  <span className="text-lg font-bold">₹{room.deposit}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-muted/40 p-4">
                  <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Sharing
                  </span>
                  <span className="text-lg font-bold capitalize">
                    {room.sharingType}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-5">
                <h3 className="text-lg font-semibold">Contact Owner</h3>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IdentificationBadgeIcon size={28} weight="duotone" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[17px] font-bold">
                      {room.contactName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Property Owner
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PhoneIcon size={28} weight="duotone" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[17px] font-bold">
                      +91 {room.contactPhone}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Mobile Number
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
