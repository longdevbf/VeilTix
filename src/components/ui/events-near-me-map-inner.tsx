"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import Link from "next/link"

// Fix default icon issue in Next.js
const eventIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface EventWithCoords {
  id: number
  title: string
  location: string
  date: string
  price: string
  lat: number
  lng: number
  distanceKm: number
}

function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 12, { duration: 1.2 })
  }, [center, map])
  return null
}

export default function EventsNearMeMapInner({
  userPos,
  events,
}: {
  userPos: [number, number]
  events: EventWithCoords[]
}) {
  return (
    <div className="h-[380px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer
        center={userPos}
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User position — pulsing blue dot */}
        <CircleMarker
          center={userPos}
          radius={10}
          pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.9, weight: 3 }}
        >
          <Popup>
            <span className="text-xs font-semibold text-blue-600">📍 Vị trí của bạn</span>
          </Popup>
        </CircleMarker>

        {/* Event markers */}
        {events.map(e => (
          <Marker key={e.id} position={[e.lat, e.lng]} icon={eventIcon}>
            <Popup minWidth={180}>
              <div className="space-y-1.5">
                <p className="font-bold text-gray-800 text-sm leading-tight">{e.title}</p>
                <p className="text-xs text-gray-500">{e.location}</p>
                <p className="text-xs text-orange-500 font-semibold">
                  {e.distanceKm < 1
                    ? `${Math.round(e.distanceKm * 1000)} m`
                    : `${e.distanceKm.toFixed(1)} km`} từ bạn
                </p>
                <p className="text-xs text-gray-400">{e.date}</p>
                <a
                  href={`/events/${e.id}`}
                  className="block mt-2 text-center text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                  Xem chi tiết →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapFlyTo center={userPos} />
      </MapContainer>
    </div>
  )
}
