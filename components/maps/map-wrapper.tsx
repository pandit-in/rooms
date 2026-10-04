"use client"

import dynamic from "next/dynamic"
import React from "react"

export const MapWrapper = dynamic(
  () => import("./room-location-viewer"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full animate-pulse rounded-md bg-muted" />
    ),
  }
)
