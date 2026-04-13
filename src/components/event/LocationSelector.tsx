"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { Search, CheckCircle, MapPin, XCircle } from "lucide-react";

interface LocationSelectorProps {
  onVerify: (address: string, lat: number, lng: number) => void;
  initialAddress?: string;
}

// Helper component to center the map when coordinates change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

// Sub-component to handle map clicks
function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const DEFAULT_CENTER: [number, number] = [21.0285, 105.8542]; // Hanoi

export default function LocationSelector({ onVerify, initialAddress = "" }: LocationSelectorProps) {
  const [address, setAddress] = useState(initialAddress);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    setVerified(false);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        setError("Could not find this address. Please try a more specific one.");
      }
    } catch (err) {
      setError("Search failed. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setCoords([lat, lng]);
    setLoading(true);
    setError(null);
    setVerified(false);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (coords) {
      setVerified(true);
      onVerify(address, coords[0], coords[1]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500/50" />
          <input
            value={address}
            onChange={(e) => {
                setAddress(e.target.value);
                setVerified(false);
            }}
            placeholder="Enter venue address..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 transition"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition flex items-center gap-2"
        >
          {loading ? "..." : <Search size={20} />}
          <span>Verify</span>
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-xs flex items-center gap-2 ml-2">
          <XCircle size={14} /> {error}
        </p>
      )}

      <div className="space-y-4">
        <p className="text-[10px] text-orange-500 font-bold uppercase tracking-[0.2em]">
          Hint: Click on the map to pin a precise location
        </p>
        <div className="h-72 rounded-2xl overflow-hidden border border-white/10 relative z-0 shadow-inner bg-black/20">
          <MapContainer
            center={coords || DEFAULT_CENTER}
            zoom={coords ? 15 : 12}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
          >
            {coords && <ChangeView center={coords} />}
            <MapEvents onClick={handleMapClick} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {coords && <Marker position={coords} />}
          </MapContainer>
        </div>

        {coords && (
          <button
            type="button"
            onClick={handleConfirm}
            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
              verified 
                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                : "bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20"
            }`}
          >
            {verified ? <CheckCircle size={20} /> : <MapPin size={20} />}
            {verified ? "Location Verified & Locked" : "Confirm Pin Location"}
          </button>
        )}
      </div>

      <style jsx global>{`
        .leaflet-container {
          filter: grayscale(0.5) contrast(1.2) invert(90%) hue-rotate(180deg);
        }
      `}</style>
    </div>
  );
}
