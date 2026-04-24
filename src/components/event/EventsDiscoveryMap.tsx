"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { MapPin, Navigation, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import L from "leaflet";

interface EventData {
  Event_ID: number;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  start_time: string;
  minPrice?: number;
  event_image?: string;
  is_online: boolean;
}

interface EventsDiscoveryMapProps {
  events: EventData[];
}

// Component to handle recentering the map when user location is found
function LocationMarker({ userLocation }: { userLocation: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 12);
    }
  }, [userLocation, map]);

  if (!userLocation) return null;

  // Custom icon for user location
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <Marker position={userLocation} icon={userIcon}>
      <Popup className="dark-popup">
        <span className="font-bold text-orange-400">You are here</span>
      </Popup>
    </Marker>
  );
}

export default function EventsDiscoveryMap({ events }: EventsDiscoveryMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  // Filter out online events and those without coordinates
  // In a real app we might geocode on the fly, but for discovery map we only show those with coords
  const mapEvents = events.filter(e => e.latitude && e.longitude && (e.is_online === false || e.is_online === 0 || e.is_online == null));

  const getUserLocation = () => {
    setLoadingLoc(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLoadingLoc(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLoc(false);
          alert("Could not get your location. Please check your browser permissions.");
        }
      );
    } else {
      setLoadingLoc(false);
      alert("Geolocation is not supported by your browser");
    }
  };

  // Default center: either user location, first event, or a generic hub (HCMC)
  const defaultCenter: [number, number] = userLocation 
    ? userLocation 
    : mapEvents.length > 0 
      ? [mapEvents[0].latitude!, mapEvents[0].longitude!]
      : [10.8231, 106.6297]; // Ho Chi Minh City default

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MapPin size={20} className="text-orange-400" />
          Event Map View
        </h3>
        <button 
          onClick={getUserLocation}
          disabled={loadingLoc}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition text-sm font-semibold disabled:opacity-50"
        >
          {loadingLoc ? (
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation size={16} />
          )}
          Find Events Near Me
        </button>
      </div>

      <div className="h-[400px] rounded-xl overflow-hidden border border-white/10 relative z-0 shadow-lg shadow-orange-500/5">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <LocationMarker userLocation={userLocation} />

          {mapEvents.map((event) => (
            <Marker key={event.Event_ID} position={[event.latitude!, event.longitude!]}>
              <Popup className="dark-popup w-64">
                <div className="flex flex-col gap-2 p-1">
                  {event.event_image && (
                    <img src={event.event_image} alt={event.title} className="w-full h-24 object-cover rounded-md" />
                  )}
                  <h4 className="font-bold text-white text-base leading-tight">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Calendar size={12} className="text-orange-400" />
                    <span>{new Date(event.start_time).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 border-t border-white/10 pt-2">
                    <span className="text-orange-400 font-bold text-sm">
                      {event.minPrice ? `${event.minPrice} ETH` : "TBA"}
                    </span>
                    <Link
                      href={`/event-detail/${event.Event_ID}`}
                      className="px-3 py-1 bg-orange-500 text-white rounded text-xs font-semibold hover:bg-orange-600 transition flex items-center gap-1"
                    >
                      View <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <p className="text-xs text-white/30 italic text-right">
        * Red marker shows your location. Blue markers show events.
      </p>

      <style jsx global>{`
        .leaflet-container {
          filter: grayscale(0.2) contrast(1.1);
        }
        .dark-popup .leaflet-popup-content-wrapper {
          background-color: #1a1a1a;
          color: white;
          border: 1px solid rgba(255,165,0,0.2);
          border-radius: 12px;
          padding: 0;
        }
        .dark-popup .leaflet-popup-content {
          margin: 12px;
        }
        .dark-popup .leaflet-popup-tip {
          background-color: #1a1a1a;
          border: 1px solid rgba(255,165,0,0.2);
        }
        .dark-popup a {
          color: inherit;
          text-decoration: none;
        }
        .dark-popup a:hover {
          color: inherit;
        }
      `}</style>
    </div>
  );
}
