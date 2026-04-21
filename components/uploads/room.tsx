// components/avatar-uploader.tsx
"use client"

import { CldUploadWidget } from "next-cloudinary"
import { Button } from "../ui/button"

interface RoomImageUploaderProps {
  onUploadSuccess: (url: string) => void
}

export function RoomImageUploader({ onUploadSuccess }: RoomImageUploaderProps) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      signatureEndpoint="/api/sign-cloudinary-params"
      onSuccess={(result) => {
        if (typeof result.info === "object" && "secure_url" in result.info) {
          onUploadSuccess(result.info.secure_url)
        }
      }}
      options={{
        multiple: true,
      }}
    >
      {({ open }) => {
        return (
          <Button type="button" onClick={() => open()}>
            Upload Image
          </Button>
        )
      }}
    </CldUploadWidget>
  )
}
