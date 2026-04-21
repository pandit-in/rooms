"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { RoomImageUploader } from "@/components/uploads/room"
import dynamic from "next/dynamic"

import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useRouter } from "next/navigation"
import { createRoomAction } from "@/app/actions/room.actions"

const RoomLocationPicker = dynamic(
  () => import("@/components/maps/room-location-picker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />
    ),
  }
)

export const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.array(z.string()),
  rent: z.number(),
  deposit: z.number(),
  location: z.string(),
  longitude: z.string(),
  latitude: z.string(),
  address: z.string(),
  amenities: z.array(z.string()),
  contactName: z.string(),
  contactPhone: z.string(),
  sharingType: z.enum(["single", "double", "triple", "quad"]),
})

const AMENITIES_LIST = [
  "Free WiFi",
  "Hot Water",
  "Parking",
  "AC",
  "Washing Machine",
  "Attached Washroom",
  "Balcony",
  "Power Backup",
  "Security",
  "RO Water",
  "Elevator",
]

export function PostRoomForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image: [],
      rent: 0,
      deposit: 0,
      location: "",
      longitude: "",
      latitude: "",
      address: "",
      amenities: [],
      contactName: "",
      contactPhone: "",
      sharingType: "single",
    },
  })

  const [images, setImages] = React.useState<string[]>([])

  React.useEffect(() => {
    form.setValue("image", images, {
      shouldValidate: images.length > 0,
      shouldDirty: images.length > 0,
    })
  }, [images, form])

  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  function onSubmit(data: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const result = await createRoomAction(data)
        if (result?.error) {
          toast.error("Error", { description: result.error })
        } else if (result?.success) {
          toast.success("Success!", {
            description: "Room posted successfully!",
          })
          router.push("/")
        }
      } catch (err) {
        console.log(err)
        toast.error("Error", { description: "Something went wrong." })
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_350px]">
      <Card className="w-full">
        <CardContent>
          <form id="post-room-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="post-room-title">Name</FieldLabel>
                    <Input
                      {...field}
                      id="post-room-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="Room Name or Owner Name"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="image"
                control={form.control}
                render={({ fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="post-room-image">Image</FieldLabel>
                    {images.length > 0 && (
                      <div className="flex justify-center px-12 pb-4">
                        <Carousel>
                          <CarouselContent>
                            {images.map((url, index) => (
                              <CarouselItem key={index}>
                                <div className="p-1">
                                  <Image
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="h-48 w-full rounded-md object-cover"
                                    width={320}
                                    height={192}
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious type="button" />
                          <CarouselNext type="button" />
                        </Carousel>
                      </div>
                    )}
                    <RoomImageUploader
                      onUploadSuccess={(url) => {
                        setImages((prev) => [...prev, url])
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="pt-2">
                <FieldLabel className="mb-2 block">Choose on Map</FieldLabel>
                <RoomLocationPicker
                  onLocationSelect={(lat, lng, address) => {
                    form.setValue("latitude", lat, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                    form.setValue("longitude", lng, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                    form.setValue("address", address, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }}
                />
              </div>
              <div className="flex flex-row gap-2">
                <Controller
                  name="longitude"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="post-room-longitude">
                        Longitude
                      </FieldLabel>
                      <Input
                        {...field}
                        id="post-room-longitude"
                        placeholder="Longitude"
                        aria-invalid={fieldState.invalid}
                        readOnly
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="latitude"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="post-room-latitude">
                        Latitude
                      </FieldLabel>
                      <Input
                        {...field}
                        id="post-room-latitude"
                        placeholder="Latitude"
                        aria-invalid={fieldState.invalid}
                        readOnly
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="post-room-address">Address</FieldLabel>
                    <Input
                      {...field}
                      id="post-room-address"
                      placeholder="Address"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* second col */}
      <Card className="w-full sm:max-w-md md:sticky md:top-16 md:self-start">
        <CardContent className="grow">
          <form id="post-room-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="rent"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="post-room-rent">
                      Rent Rs (per month)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="post-room-rent"
                      placeholder="1200"
                      aria-invalid={fieldState.invalid}
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="deposit"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="post-room-deposit">
                      Deposit Rs
                    </FieldLabel>
                    <Input
                      {...field}
                      id="post-room-deposit"
                      placeholder="5000"
                      aria-invalid={fieldState.invalid}
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="contactPhone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="post-room-contactPhone">
                      Contact No
                    </FieldLabel>
                    <Input
                      {...field}
                      id="post-room-contactPhone"
                      placeholder="8112233445"
                      aria-invalid={fieldState.invalid}
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="contactName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="post-room-contactName">
                      Contact Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="post-room-contactName"
                      placeholder="Akash Kumar"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="sharingType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="post-room-sharingType">
                      Sharing Type
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose sharing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                          <SelectItem value="triple">Triple</SelectItem>
                          <SelectItem value="quad">Quad</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="amenities"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="post-room-amenities">
                      Amenities
                    </FieldLabel>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {AMENITIES_LIST.map((amenity) => {
                        const isSelected = field.value.includes(amenity)
                        return (
                          <button
                            type="button"
                            key={amenity}
                            onClick={() => {
                              if (isSelected) {
                                field.onChange(
                                  field.value.filter(
                                    (a: string) => a !== amenity
                                  )
                                )
                              } else {
                                field.onChange([...field.value, amenity])
                              }
                            }}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            {isSelected && <span className="mr-1">✓</span>}
                            {amenity}
                          </button>
                        )
                      })}
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="post-room-description">
                      Description
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="post-room-description"
                        placeholder="Description"
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" form="post-room-form" disabled={isPending}>
              {isPending ? "Posting..." : "Post Room"}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  )
}
