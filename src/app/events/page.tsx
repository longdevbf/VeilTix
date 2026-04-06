"use client"

import { useMemo, useState, useEffect } from "react"
import { Calendar, MapPin, Search, Users, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"


export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const EVENTS_PER_PAGE = 9

  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events")
        if (!res.ok) throw new Error("Failed to fetch events")
        const data = await res.json()
        setEvents(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, events])


  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE)

  // Reset to page 1 when search term changes
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black pt-20">
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Discover Events
          </h1>

          <p className="text-xl text-white/70 mb-8">
            Explore upcoming blockchain-powered events
          </p>

          <div className="relative max-w-md mb-12">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by event name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-orange-500/30 bg-orange-500/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 outline-none transition focus:border-orange-400 focus:bg-orange-500/10"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full py-20 text-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60">Loading events...</p>
              </div>
            ) : error ? (
              <div className="col-span-full py-20 text-center text-red-400">
                <p>{error}</p>
              </div>
            ) : paginatedEvents.length > 0 ? (
              paginatedEvents.map((event) => (
                <Link
                  key={event.Event_ID}
                  href={`/event-detail/${event.Event_ID}`}
                  className="border border-orange-500/30 rounded-lg overflow-hidden bg-orange-500/5 hover:bg-orange-500/10 transition group"
                >
                  <div className="h-48 bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center relative overflow-hidden">
                    {event.event_image ? (
                      <img src={event.event_image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    ) : (
                      <div className="text-center group-hover:scale-110 transition duration-500">
                        <Calendar className="text-orange-400 mx-auto mb-2" size={32} />
                        <p className="text-white/60 text-sm">Event Image</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 group-hover:text-orange-400 transition">
                      {event.title}
                    </h3>

                    <div className="space-y-3 mb-6 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-orange-400" />
                        <span>{new Date(event.start_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-orange-400" />
                        <span>{event.location}</span>
                      </div>
                      {/* Note: Attendees count might need to be joined from Orders if intended, for now showing total tiers supply or static */}
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-orange-400" />
                        <span>Active</span>
                      </div>
                    </div>

                    <div className="border-t border-orange-500/20 pt-4 flex items-center justify-between">
                      <span className="text-orange-400 font-bold">
                        {event.minPrice ? `${event.minPrice} ETH` : "TBA"}
                      </span>
                      <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded group-hover:bg-orange-500 text-white transition text-sm font-semibold">
                        Get Ticket
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : null}
          </div>

          {filteredEvents.length > 0 && (
            <div className="mt-16 flex flex-col items-center gap-8">
              {/* Pagination Info */}
              <div className="text-white/60 text-sm">
                Showing {startIndex + 1} to {Math.min(startIndex + EVENTS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length} events
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-orange-500/30 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Page Numbers */}
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-semibold transition ${
                        page === currentPage
                          ? "bg-orange-500 text-white"
                          : "border border-orange-500/30 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-orange-500/30 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {filteredEvents.length === 0 && searchTerm && (
            <div className="text-center mt-16">
              <p className="text-white/60 text-lg">
                No events found for &quot;{searchTerm}&quot;
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}