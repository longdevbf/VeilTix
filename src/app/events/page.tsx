"use client"

import { useMemo, useState } from "react"
import { Calendar, MapPin, Search, Users, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"


export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const EVENTS_PER_PAGE = 9

  const filteredEvents = useMemo(() => {
    const events = [
      {
        id: 1,
        title: "Web3 Conference 2024",
        date: "Mar 15, 2024",
        location: "San Francisco, CA",
        attendees: 2500,
        price: "0.5 ETH",
      },
      {
        id: 2,
        title: "Crypto Music Festival",
        date: "Apr 20, 2024",
        location: "Miami, FL",
        attendees: 5000,
        price: "0.25 ETH",
      },
      {
        id: 3,
        title: "NFT Art Exhibition",
        date: "May 1, 2024",
        location: "New York, NY",
        attendees: 1200,
        price: "0.1 ETH",
      },
      {
        id: 4,
        title: "Blockchain Gaming Summit",
        date: "May 10, 2024",
        location: "Los Angeles, CA",
        attendees: 3200,
        price: "0.15 ETH",
      },
      {
        id: 5,
        title: "DeFi Protocol Meetup",
        date: "May 25, 2024",
        location: "Austin, TX",
        attendees: 800,
        price: "0.05 ETH",
      },
      {
        id: 6,
        title: "Web3 Developer Bootcamp",
        date: "Jun 5, 2024",
        location: "Denver, CO",
        attendees: 1500,
        price: "0.3 ETH",
      },
      {
        id: 7,
        title: "Metaverse Fashion Show",
        date: "Jun 15, 2024",
        location: "Virtual Event",
        attendees: 10000,
        price: "0.08 ETH",
      },
      {
        id: 8,
        title: "DAO Governance Workshop",
        date: "Jun 20, 2024",
        location: "Berlin, Germany",
        attendees: 600,
        price: "0.12 ETH",
      },
      {
        id: 9,
        title: "NFT Creators Expo",
        date: "Jul 1, 2024",
        location: "London, UK",
        attendees: 2000,
        price: "0.1 ETH",
      },
      {
        id: 10,
        title: "Smart Contract Audit Training",
        date: "Jul 10, 2024",
        location: "Singapore",
        attendees: 300,
        price: "0.4 ETH",
      },
      {
        id: 11,
        title: "Crypto Art Collector's Summit",
        date: "Jul 18, 2024",
        location: "Tokyo, Japan",
        attendees: 1800,
        price: "0.2 ETH",
      },
      {
        id: 12,
        title: "Web3 Marketing Conference",
        date: "Aug 5, 2024",
        location: "Toronto, Canada",
        attendees: 2200,
        price: "0.18 ETH",
      },
      {
        id: 13,
        title: "Tokenomics Design Workshop",
        date: "Aug 12, 2024",
        location: "Dubai, UAE",
        attendees: 900,
        price: "0.25 ETH",
      },
      {
        id: 14,
        title: "Web3 Security Forum",
        date: "Aug 20, 2024",
        location: "Stockholm, Sweden",
        attendees: 1100,
        price: "0.22 ETH",
      },
      {
        id: 15,
        title: "Decentralized Finance Summit",
        date: "Sep 1, 2024",
        location: "Hong Kong",
        attendees: 4000,
        price: "0.35 ETH",
      },
      {
        id: 16,
        title: "Web3 Product Launch",
        date: "Sep 10, 2024",
        location: "São Paulo, Brazil",
        attendees: 3500,
        price: "0.15 ETH",
      },
      {
        id: 17,
        title: "ERC-20 Token Standards Seminar",
        date: "Sep 22, 2024",
        location: "Amsterdam, Netherlands",
        attendees: 750,
        price: "0.1 ETH",
      },
      {
        id: 18,
        title: "Blockchain Innovation Expo",
        date: "Oct 5, 2024",
        location: "Barcelona, Spain",
        attendees: 3800,
        price: "0.2 ETH",
      },
      {
        id: 19,
        title: "Web3 Community Gathering",
        date: "Oct 15, 2024",
        location: "Montreal, Canada",
        attendees: 2100,
        price: "0.08 ETH",
      },
      {
        id: 20,
        title: "Crypto Investment Roundtable",
        date: "Oct 25, 2024",
        location: "Geneva, Switzerland",
        attendees: 500,
        price: "0.5 ETH",
      },
    ]
    return events.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

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
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/event-detail/${event.id}`}
                  className="border border-orange-500/30 rounded-lg overflow-hidden bg-orange-500/5 hover:bg-orange-500/10 transition group"
                >
                  <div className="h-48 bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center relative overflow-hidden">
                    <div className="text-center group-hover:scale-110 transition duration-500">
                      <Calendar className="text-orange-400 mx-auto mb-2" size={32} />
                      <p className="text-white/60 text-sm">Event Image</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 group-hover:text-orange-400 transition">
                      {event.title}
                    </h3>

                    <div className="space-y-3 mb-6 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-orange-400" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-orange-400" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-orange-400" />
                        <span>{event.attendees} interested</span>
                      </div>
                    </div>

                    <div className="border-t border-orange-500/20 pt-4 flex items-center justify-between">
                      <span className="text-orange-400 font-bold">
                        {event.price}
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