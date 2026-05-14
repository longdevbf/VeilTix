"use client"
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
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
    }, 500) // faster timeout for display
    
    return () => clearTimeout(timeoutId)
  }, [address, map, setPosition])
  
  return null
}

export default function MapDisplay({ address }: { address: string }) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-300 shadow-sm relative z-0 mt-4">
      <MapContainer center={[10.762622, 106.660172]} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && <Marker position={position} icon={customIcon} />}
        <MapController address={address} setPosition={setPosition} />
      </MapContainer>
    </div>
  )
}
