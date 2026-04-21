"use client"

import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, Circle } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

export default function RoomLocationViewer({ lat, lng }: { lat: string, lng: string }) {
  const position = new L.LatLng(parseFloat(lat), parseFloat(lng))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null;

  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      scrollWheelZoom={false} 
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* 200m approx radius to show area without exposing exact pinpoint if desired, though we have exact pin */}
      <Circle center={position} radius={250} pathOptions={{ color: "#e11d48", fillColor: "#e11d48", fillOpacity: 0.1, weight: 1 }} />
      <CircleMarker center={position} radius={8} pathOptions={{ color: "white", fillColor: "#e11d48", fillOpacity: 1, weight: 3 }} />
      
    </MapContainer>
  )
}
