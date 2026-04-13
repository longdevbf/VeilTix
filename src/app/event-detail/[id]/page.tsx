"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, MapPin, Users, ArrowLeft, Share2, Shield, Ticket, Clock, Info } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

const EventMap = dynamic(() => import("@/components/event/EventMap"), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-white/5 animate-pulse rounded-xl mt-6 border border-white/10" />
});

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`)
        if (!res.ok) throw new Error("Event not found")
        const data = await res.json()
        setEvent(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-2xl font-bold mb-4">{error || "Event not found"}</h1>
        <button onClick={() => router.back()} className="text-orange-400 hover:underline flex items-center gap-2">
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    )
  }


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
                      <p className="text-xl font-bold">{new Date(event.start_time).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm uppercase tracking-wider font-semibold">Time</p>
                      <p className="text-xl font-bold">{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                      <p className="text-white/50 text-sm uppercase tracking-wider font-semibold">Status</p>
                      <p className="text-xl font-bold capitalize">{event.status}</p>
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
                    {/* Location Map */}
                    <EventMap 
                      location={event.location} 
                      latitude={event.latitude}
                      longitude={event.longitude}
                    />
                  </div>

                  <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Ticket size={18} className="text-orange-400" />
                      Ticket Tiers
                    </h3>
                    <div className="space-y-4">
                      {event.tiers && event.tiers.length > 0 ? (
                        event.tiers.map((tier: any) => (
                          <div key={tier.Ticket_Tier_ID} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                            <div>
                              <p className="font-bold text-white">{tier.tier}</p>
                              <p className="text-xs text-white/40">Max Supply: {tier.max_supply}</p>
                            </div>
                            <p className="font-bold text-orange-400">{tier.price} ETH</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-white/40 text-sm italic">No ticket tiers available for this event yet.</p>
                      )}
                    </div>
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
                  <p className="text-white/60 text-sm mb-1 uppercase tracking-widest font-bold">Starting From</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">
                      {event.tiers && event.tiers.length > 0
                        ? Math.min(...event.tiers.map((t: any) => t.price))
                        : "TBA"}
                    </span>
                    <span className="text-2xl font-bold text-orange-400">ETH</span>
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

              {/* Organizer & Contract Info */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-3">Organizer Wallet</p>
                  <p className="font-mono text-xs text-orange-400 break-all bg-black/30 p-2 rounded">
                    {event.Wallet_ID || "Main Organizer"}
                  </p>
                </div>
                {event.contract_address && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-3">Contract Address</p>
                    <p className="font-mono text-xs text-blue-400 break-all bg-black/30 p-2 rounded">
                      {event.contract_address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
