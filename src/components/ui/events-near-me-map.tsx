"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { MapPin, Loader2, Navigation, X, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────────────────

interface AppEvent {
  id: number
  title: string
  location: string
  date: string
  price: string
  image: string | null
}

interface EventWithCoords extends AppEvent {
  lat: number
  lng: number
  distanceKm: number
}

// ─── Haversine distance ───────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Geocode cache ────────────────────────────────────────────────────────────

const geocodeCache = new Map<string, [number, number] | null>()

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  if (!address || address.length < 3) return null
  const key = address.trim().toLowerCase()
  if (geocodeCache.has(key)) return geocodeCache.get(key)!

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=vi,en`,
      { headers: { "User-Agent": "VeilTix/1.0" } }
    )
    const data = await res.json()
    if (data && data.length > 0) {
      const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      geocodeCache.set(key, coords)
      return coords
    }
  } catch { /* ignore */ }
  geocodeCache.set(key, null)
  return null
}

// ─── Lazy-load map (SSR safe) ─────────────────────────────────────────────────

const NearMeMapInner = dynamic(() => import("./events-near-me-map-inner"), { ssr: false })

// ─── RADIUS options ───────────────────────────────────────────────────────────

const RADIUS_OPTIONS = [
  { label: "5 km", value: 5 },
  { label: "20 km", value: 20 },
  { label: "50 km", value: 50 },
  { label: "Tất cả", value: Infinity },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function EventsNearMeMap({ events }: { events: AppEvent[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [nearEvents, setNearEvents] = useState<EventWithCoords[]>([])
  const [radius, setRadius] = useState<number>(20)
  const geocodingRef = useRef(false)

  // ── Geocode all events once userPos is known ──────────────────────────────
  const resolveNearEvents = useCallback(
    async (pos: [number, number], events: AppEvent[]) => {
      if (geocodingRef.current) return
      geocodingRef.current = true
      setGeocoding(true)

      // Stagger requests to respect Nominatim rate-limit (1 req/s)
      const results: EventWithCoords[] = []
      for (let i = 0; i < events.length; i++) {
        const e = events[i]
        if (!e.location || e.location === "On-chain Event") continue
        await new Promise(r => setTimeout(r, i === 0 ? 0 : 1100))
        const coords = await geocodeAddress(e.location)
        if (!coords) continue
        results.push({
          ...e,
          lat: coords[0],
          lng: coords[1],
          distanceKm: haversineKm(pos[0], pos[1], coords[0], coords[1]),
        })
      }

      results.sort((a, b) => a.distanceKm - b.distanceKm)
      setNearEvents(results)
      setGeocoding(false)
      geocodingRef.current = false
    },
    []
  )

  // ── Locate user ────────────────────────────────────────────────────────────
  const locate = useCallback(() => {
    setLocError(null)
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserPos(coords)
        setLocating(false)
      },
      err => {
        setLocating(false)
        setLocError(
          err.code === 1
            ? "Bạn đã từ chối quyền vị trí. Vui lòng cho phép trong cài đặt trình duyệt."
            : "Không thể lấy vị trí. Thử lại sau."
        )
      },
      { timeout: 10000 }
    )
  }, [])

  useEffect(() => {
    if (userPos && events.length > 0) {
      resolveNearEvents(userPos, events)
    }
  }, [userPos, events, resolveNearEvents])

  // Filter by radius
  const filtered = radius === Infinity
    ? nearEvents
    : nearEvents.filter(e => e.distanceKm <= radius)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-10 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header toggle */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
            <Navigation size={18} className="text-orange-500" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 text-sm">Sự kiện gần tôi</p>
            <p className="text-xs text-gray-400">Tìm sự kiện dựa trên vị trí của bạn</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-6 space-y-5">
              {/* Locate button + error */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={locate}
                  disabled={locating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-60 transition-colors shadow-sm shadow-orange-500/25"
                >
                  {locating
                    ? <Loader2 size={16} className="animate-spin" />
                    : <MapPin size={16} />}
                  {locating ? "Đang lấy vị trí..." : userPos ? "Cập nhật vị trí" : "Lấy vị trí của tôi"}
                </motion.button>

                {userPos && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                    ✓ Đã xác định vị trí
                  </span>
                )}

                {locError && (
                  <span className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 max-w-xs">
                    {locError}
                  </span>
                )}
              </div>

              {/* Radius filter */}
              {userPos && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 font-medium">Bán kính:</span>
                  {RADIUS_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setRadius(opt.value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        radius === opt.value
                          ? "bg-orange-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Map */}
              {userPos && (
                <div>
                  {geocoding && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <Loader2 size={12} className="animate-spin" />
                      Đang xác định vị trí các sự kiện...
                    </div>
                  )}
                  <NearMeMapInner
                    userPos={userPos}
                    events={filtered}
                  />
                </div>
              )}

              {/* Event list */}
              {userPos && !geocoding && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {filtered.length > 0
                      ? `${filtered.length} sự kiện${radius !== Infinity ? ` trong vòng ${radius} km` : ""}`
                      : "Không tìm thấy sự kiện nào trong bán kính này"}
                  </p>
                  <div className="space-y-2">
                    {filtered.slice(0, 5).map((e, i) => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-orange-500">
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{e.title}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin size={10} />
                              {e.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                            {e.distanceKm < 1
                              ? `${Math.round(e.distanceKm * 1000)} m`
                              : `${e.distanceKm.toFixed(1)} km`}
                          </span>
                          <Link
                            href={`/events/${e.id}`}
                            className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                          >
                            Xem
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt before locating */}
              {!userPos && !locating && !locError && (
                <div className="text-center py-8 text-gray-400">
                  <Navigation size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nhấn &quot;Lấy vị trí của tôi&quot; để bắt đầu</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
