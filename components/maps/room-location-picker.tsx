"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  useMapEvents,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface RoomLocationPickerProps {
  onLocationSelect: (lat: string, lng: string, address: string) => void
  initialAddress?: string
  initialLocation?: string
}

const CACHE = new Map<string, string>()

function MapEventsHandler({
  onMapMoveEnd,
  centerPosition,
}: {
  onMapMoveEnd: (center: L.LatLng) => void
  centerPosition: L.LatLng | null
}) {
  const map = useMapEvents({
    moveend: () => {
      onMapMoveEnd(map.getCenter())
    },
  })

  useEffect(() => {
    if (centerPosition) {
      if (map.getCenter().distanceTo(centerPosition) > 10) {
        map.flyTo(centerPosition, map.getZoom(), { duration: 0.5 })
      }
    }
  }, [centerPosition, map])

  return null
}

export default function RoomLocationPicker({
  onLocationSelect,
  initialAddress,
  initialLocation,
}: RoomLocationPickerProps) {
  const defaultPosition = new L.LatLng(28.6139, 77.209) // New Delhi as default

  const getInitialPos = () => {
    if (initialLocation) {
      const parts = initialLocation.split(",").map((s) => parseFloat(s.trim()))
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return new L.LatLng(parts[0], parts[1])
      }
    }
    return defaultPosition
  }

  const [initialPos] = useState<L.LatLng>(getInitialPos())
  const [position, setPosition] = useState<L.LatLng>(initialPos)
  const [address, setAddress] = useState(initialAddress || "")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [isFetchingAddress, setIsFetchingAddress] = useState(false)

  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null)
  const [userAccuracy, setUserAccuracy] = useState<number>(0)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAddress = async (latlng: L.LatLng) => {
    const cacheKey = `${latlng.lat.toFixed(4)},${latlng.lng.toFixed(4)}`
    if (CACHE.has(cacheKey)) {
      setAddress(CACHE.get(cacheKey)!)
      return
    }

    setIsFetchingAddress(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      )
      const data = await response.json()
      if (data && data.display_name) {
        setAddress(data.display_name)
        CACHE.set(cacheKey, data.display_name)
      } else {
        setAddress("Unknown Location")
      }
    } catch (error) {
      console.error("Error fetching address:", error)
      setAddress("Error finding address")
    } finally {
      setIsFetchingAddress(false)
    }
  }

  const handleMapMoveEnd = useCallback((center: L.LatLng) => {
    setPosition(center)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      fetchAddress(center)
    }, 400)
  }, [])

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = new L.LatLng(pos.coords.latitude, pos.coords.longitude)
        setUserLocation(newPos)
        setUserAccuracy(pos.coords.accuracy)
        setPosition(newPos)
        fetchAddress(newPos)
        setIsLocating(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert(
          "Unable to retrieve your location. Please check your permissions."
        )
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return
    setIsFetchingAddress(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const newPos = new L.LatLng(parseFloat(lat), parseFloat(lon))
        setPosition(newPos)
        setAddress(display_name)

        const cacheKey = `${newPos.lat.toFixed(4)},${newPos.lng.toFixed(4)}`
        CACHE.set(cacheKey, display_name)
      } else {
        alert("Location not found.")
      }
    } catch (error) {
      console.error("Error searching location:", error)
    } finally {
      setIsFetchingAddress(false)
    }
  }

  const handleConfirm = () => {
    onLocationSelect(position.lat.toFixed(6), position.lng.toFixed(6), address)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search for a place (e.g. Connaught Place)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-[200px] flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSearch(e)
            }
          }}
        />
        <Button type="button" onClick={handleSearch}>
          Search
        </Button>
        <Button
          type="button"
          onClick={handleCurrentLocation}
          disabled={isLocating}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isLocating ? (
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          )}
          Locate Me
        </Button>
      </div>

      <div className="relative h-[300px] w-full overflow-hidden rounded-none border bg-muted">
        {/* Loading overlay for address fetch */}
        {isFetchingAddress && (
          <div className="absolute top-2 right-2 z-100 flex items-center gap-2 rounded bg-background/80 px-2 py-1 text-xs shadow-sm">
            <svg
              className="h-3 w-3 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading address...
          </div>
        )}

        {/* Center Pin overlay */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-100 -translate-x-1/2 -translate-y-full drop-shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary transition-transform duration-100 ease-in-out"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" fill="white" />
          </svg>
        </div>

        <MapContainer
          center={initialPos}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEventsHandler
            onMapMoveEnd={handleMapMoveEnd}
            centerPosition={position}
          />

          {userLocation && (
            <>
              <Circle
                center={userLocation}
                radius={userAccuracy}
                pathOptions={{
                  color: "blue",
                  fillColor: "blue",
                  fillOpacity: 0.1,
                  weight: 1,
                }}
              />
              <CircleMarker
                center={userLocation}
                radius={6}
                pathOptions={{
                  color: "white",
                  fillColor: "#2563eb",
                  fillOpacity: 1,
                  weight: 2,
                }}
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* Selected Address Display & Confirm */}
      <div className="flex flex-col gap-2 rounded-none border bg-muted/30 p-3">
        <div className="text-sm font-medium">Selected Location</div>
        <div className="flex min-h-[40px] items-center text-sm text-muted-foreground">
          {isFetchingAddress ? (
            <span className="animate-pulse">Fetching address details...</span>
          ) : address ? (
            address
          ) : (
            "Move the map to select a location"
          )}
        </div>
        <div className="text-xs text-muted-foreground/60">
          {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </div>
        <Button
          type="button"
          onClick={handleConfirm}
          className="mt-2 w-full self-end sm:w-auto"
          disabled={!address || isFetchingAddress}
        >
          Confirm Location
        </Button>
      </div>
    </div>
  )
}
