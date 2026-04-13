"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { MapPin, Globe } from "lucide-react";

interface EventMapProps {
  location: string;
  latitude?: number;
  longitude?: number;
}

export default function EventMap({ location, latitude, longitude }: EventMapProps) {
  const [coords, setCoords] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [loading, setLoading] = useState(!latitude || !longitude);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // If we already have coordinates, no need to geocode
    if (latitude && longitude) {
      setCoords([latitude, longitude]);
      setLoading(false);
      return;
    }

    if (!location) {
      setLoading(false);
      return;
    }

    const onlineKeywords = ["online", "zoom", "meet", "virtual", "trực tuyến", "video call"];
    if (onlineKeywords.some(keyword => location.toLowerCase().includes(keyword))) {
      setIsOnline(true);
      setLoading(false);
      return;
    }

    const fetchCoords = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoords();
  }, [location]);

  if (loading) {
    return (
      <div className="w-full h-64 bg-white/5 animate-pulse rounded-xl flex items-center justify-center border border-white/10">
        <p className="text-white/40">Loading map...</p>
      </div>
    );
  }

  if (isOnline) {
    return (
      <div className="w-full p-6 rounded-xl bg-orange-500/5 border border-orange-500/20 flex flex-col items-center justify-center text-center gap-3">
        <div className="p-3 rounded-full bg-orange-500/10 text-orange-400">
          <Globe size={32} />
        </div>
        <div>
          <h4 className="font-bold text-white">Online Event</h4>
          <p className="text-white/50 text-sm">This event takes place virtually.</p>
        </div>
      </div>
    );
  }

  if (!coords) return null;

  return (
    <div className="w-full mt-6 space-y-3">
      <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
        <MapPin size={14} />
        Location Map
      </h3>
      <div className="h-64 rounded-xl overflow-hidden border border-white/10 relative z-0">
        <MapContainer
          center={coords}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
        >
          {/* Dark themed tile layer using CartoDB Dark Matter */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={coords}>
            <Popup className="dark-popup">
              <span className="font-bold">{location}</span>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <p className="text-xs text-white/30 italic">
        * Map powered by OpenStreetMap & Nominatim
      </p>

      <style jsx global>{`
        .leaflet-container {
          filter: grayscale(0.2) contrast(1.1);
        }
        .dark-popup .leaflet-popup-content-wrapper {
          background-color: #1a1a1a;
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
        }
        .dark-popup .leaflet-popup-tip {
          background-color: #1a1a1a;
        }
      `}</style>
    </div>
  );
}
