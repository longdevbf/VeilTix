"use client"
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

function MapController({ address, setPosition }: { address?: string, setPosition: (pos: [number, number]) => void }) {
  const map = useMap()
  
  useEffect(() => {
    if (!address || address.length < 5) return
    
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=vi,en`)
        const data = await res.json()
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat)
          const lon = parseFloat(data[0].lon)
          map.flyTo([lat, lon], 15)
          setPosition([lat, lon])
        }
      } catch (error) {
        console.error("Geocoding error", error)
      }
    }, 1500)
    
    return () => clearTimeout(timeoutId)
  }, [address, map, setPosition])
  
  return null
}

function LocationMarker({ position, setPosition, onLocationSelect }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void, onLocationSelect: (addr: string) => void }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi,en`)
        const data = await res.json()
        if (data && data.display_name) {
          onLocationSelect(data.display_name)
        }
      } catch (error) {
        console.error("Error fetching address:", error)
      }
    },
  })
  
  return position === null ? null : <Marker position={position} icon={customIcon} />
}

export default function MapLocationPicker({ onLocationSelect, searchQuery }: { onLocationSelect: (address: string) => void, searchQuery?: string }) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-300 shadow-sm relative z-0">
      <MapContainer center={[10.762622, 106.660172]} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
        <MapController address={searchQuery} setPosition={setPosition} />
      </MapContainer>
    </div>
  )
}
