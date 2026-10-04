// components/avatar-uploader.tsx
"use client"

import { CldUploadWidget } from "next-cloudinary"
import { Button } from "../ui/button"
import { CameraIcon } from "@phosphor-icons/react"

interface AvatarUploaderProps {
  onUploadSuccess: (url: string) => void
}

export function AvatarUploader({ onUploadSuccess }: AvatarUploaderProps) {
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
        singleUploadAutoClose: true,
      }}
    >
      {({ open }) => {
        return (
          <Button
            type="button"
            onClick={() => open()}
            variant="outline"
            className="w-full cursor-pointer"
          >
            <CameraIcon size={24} /> Upload Avatar
          </Button>
        )
      }}
    </CldUploadWidget>
  )
}
