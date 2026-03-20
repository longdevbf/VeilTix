"use client"

import { useMemo, useState } from "react"
import { Calendar, MapPin, Search, Users } from "lucide-react"

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")

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
  ]

  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [events, searchTerm])

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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-orange-500/30 bg-orange-500/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 outline-none transition focus:border-orange-400 focus:bg-orange-500/10"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-orange-500/30 rounded-lg overflow-hidden bg-orange-500/5 hover:bg-orange-500/10 transition"
                >
                  <div className="h-48 bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                    <div className="text-center">
                      <Calendar className="text-orange-400 mx-auto mb-2" size={32} />
                      <p className="text-white/60 text-sm">Event Image</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">
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
                      <button className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition text-sm font-semibold">
                        Get Ticket
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-3 text-center py-16">
                <p className="text-white/60 text-lg">
                  No events found for "{searchTerm}"
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-16">
            <p className="text-white/60 mb-4">More events coming soon...</p>
          </div>
        </div>
      </section>
    </div>
  )
}