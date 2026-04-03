"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, MapPin, Users, ArrowLeft, Share2, Shield, Ticket, Clock, Info } from "lucide-react"
import Link from "next/link"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const events = useMemo(() => [
    {
      id: 1,
      title: "Web3 Conference 2024",
      date: "Mar 15, 2024",
      time: "09:00 AM - 05:00 PM",
      location: "San Francisco, CA",
      address: "Moscone Center, 747 Howard St, San Francisco, CA 94103",
      attendees: 2500,
      price: "0.5 ETH",
      description: "Join us for the most anticipated Web3 conference of the year. Featuring speakers from top blockchain projects, decentralized finance protocols, and NFT marketplaces. Learn about the future of the decentralized web and network with industry leaders.",
      organizer: "Web3 Foundation",
    },
    {
      id: 2,
      title: "Crypto Music Festival",
      date: "Apr 20, 2024",
      time: "02:00 PM - 11:00 PM",
      location: "Miami, FL",
      address: "Bayfront Park, 301 Biscayne Blvd, Miami, FL 33132",
      attendees: 5000,
      price: "0.25 ETH",
      description: "Experience the fusion of music and blockchain technology. A one-of-a-kind festival featuring world-renowned artists and exclusive NFT drops for attendees. Dance to the rhythm of the future in the heart of Miami.",
      organizer: "CryptoBeats",
    },
    {
      id: 3,
      title: "NFT Art Exhibition",
      date: "May 1, 2024",
      time: "10:00 AM - 08:00 PM",
      location: "New York, NY",
      address: "The Shed, 545 W 30th St, New York, NY 10001",
      attendees: 1200,
      price: "0.1 ETH",
      description: "Discover the next generation of digital art. This exhibition showcases groundbreaking NFT pieces from established and emerging artists. Explore the intersection of creativity and blockchain technology through immersive digital installations.",
      organizer: "Digital Canvas",
    },
    // Add more if needed, or handle missing ID
  ], [])

  const event = events.find((e) => e.id === id) || events[0] // Fallback to first if not found

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
          <span>Back to Events</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Event Details */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden border border-orange-500/20 bg-orange-500/5 mb-8">
              <div className="h-80 bg-gradient-to-br from-orange-500/20 to-orange-600/30 flex items-center justify-center relative">
                <div className="text-center p-8">
                   <Calendar size={64} className="text-orange-400 mx-auto mb-4 opacity-50" />
                   <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                    {event.title}
                  </h1>
                </div>
                {/* Badge */}
                <div className="absolute top-6 right-6">
                  <span className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-bold shadow-lg shadow-orange-500/20">
                    Blockchain Verified
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-orange-500/10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm uppercase tracking-wider font-semibold">Date</p>
                      <p className="text-xl font-bold">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm uppercase tracking-wider font-semibold">Time</p>
                      <p className="text-xl font-bold">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm uppercase tracking-wider font-semibold">Location</p>
                      <p className="text-xl font-bold">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm uppercase tracking-wider font-semibold">Attending</p>
                      <p className="text-xl font-bold">{event.attendees.toLocaleString()} Guests</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                       <Info size={24} className="text-orange-400" />
                       About this event
                    </h2>
                    <p className="text-white/70 leading-relaxed text-lg">
                      {event.description}
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                       <MapPin size={18} className="text-orange-400" />
                       Venue Information
                    </h3>
                    <p className="text-white/60 text-sm">
                      {event.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="p-8 rounded-2xl border border-orange-500/30 bg-orange-500/5 backdrop-blur-sm shadow-xl shadow-orange-500/5">
                <div className="mb-6">
                  <p className="text-white/60 text-sm mb-1 uppercase tracking-widest font-bold">Ticket Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">{event.price.split(' ')[0]}</span>
                    <span className="text-2xl font-bold text-orange-400">{event.price.split(' ')[1]}</span>
                  </div>
                </div>

                <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 mb-4 group">
                  <Ticket size={24} className="group-hover:rotate-12 transition" />
                  Buy Ticket Now
                </button>

                <div className="flex gap-4">
                  <button className="flex-1 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-white/50">
                    <Shield size={18} className="text-green-400" />
                    <span>Secure Blockchain Payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/50">
                    <Ticket size={18} className="text-blue-400" />
                    <span>Instant NFT Receipt</span>
                  </div>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-3">Organizer</p>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-xl">
                      {event.organizer[0]}
                   </div>
                   <div>
                      <p className="font-bold">{event.organizer}</p>
                      <Link href="#" className="text-orange-400 text-sm hover:underline">View Profile</Link>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
