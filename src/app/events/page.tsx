"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Calendar, MapPin, Search, Users, ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react"
import { PageBg } from "@/components/ui/page-bg"
import { TiltCard } from "@/components/ui/tilt-card"
import { TicketStack } from "@/components/ui/scene-3d"
import { formatEther } from "viem"
import { useReadContract } from "wagmi"
import { VEILTIX_ABI, CONTRACT_ADDRESS } from "@/config/contract"
import { useVeilTix } from "@/hooks/use-veiltix"
import Link from "next/link"
import { getEvents } from "@/actions/event-actions"

interface AppEvent {
  id: number; title: string; date: string; location: string; attendees: number;
  sold: number; price: string; priceRaw: bigint; isActive: boolean; image: string | null; description: string;
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const EVENTS_PER_PAGE = 9
  const { } = useVeilTix()

  const { data: nextEventIdRaw, isLoading: isIdLoading } = useReadContract({
    address: CONTRACT_ADDRESS, abi: VEILTIX_ABI, functionName: "nextEventId",
  })
  const nextEventId = nextEventIdRaw ? Number(nextEventIdRaw) : 0

  const [eventsData, setEventsData] = useState<AppEvent[]>([])
  const [isDataLoading, setIsDataLoading] = useState(false)

  const fetchAllEvents = useCallback(async () => {
    setIsDataLoading(true)
    try {
      const dbEvents = await getEvents()
      const results: AppEvent[] = dbEvents.map((dbEvent: any) => {
        let imageUrl = dbEvent.image;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob')) {
          imageUrl = `https://ipfs.io/ipfs/${imageUrl}`;
        }
        let displayPrice = "Free"; let priceWei = BigInt(0);
        if (dbEvent.price && dbEvent.price !== "0") { priceWei = BigInt(dbEvent.price); displayPrice = formatEther(priceWei); }
        return {
          id: Number(dbEvent.event_id), title: dbEvent.title,
          date: new Date(dbEvent.start_time).toLocaleDateString('vi-VN'),
          location: dbEvent.location || "On-chain Event",
          attendees: dbEvent.total_tickets || 0, sold: dbEvent.sold_tickets || 0,
          price: displayPrice, priceRaw: priceWei, isActive: dbEvent.status === "active",
          image: imageUrl || null, description: dbEvent.description || ""
        };
      })
      setEventsData(results)
    } catch (err) { console.error(err); setEventsData([]) }
    finally { setIsDataLoading(false) }
  }, [])

  useEffect(() => { if (nextEventId > 0) fetchAllEvents() }, [nextEventId, fetchAllEvents])

  const filteredEvents = useMemo(() =>
    eventsData.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
  , [eventsData, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE))
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE)
  const handleSearch = (v: string) => { setSearchTerm(v); setCurrentPage(1) }
  const goToPage = (p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages)))
  const isGlobalLoading = isIdLoading || (nextEventId > 0 && isDataLoading)

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBg variant="events" grid />
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight"
              >
                Discover Events
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                className="text-gray-500 text-lg">
                Explore upcoming blockchain-powered events
              </motion.p>
            </div>

            {/* 3D ticket stack illustration */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="hidden md:block flex-shrink-0" style={{ perspective: 800 }}>
              <TicketStack />
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="flex-shrink-0">
              <Link href="/create" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-colors font-bold text-sm shadow-lg shadow-orange-500/25">
                <Plus size={18} /> Create Event
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative max-w-md mb-10"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text" placeholder="Search events..." value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition shadow-sm"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {isGlobalLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="text-orange-500" size={40} />
              </motion.div>
              <p className="text-gray-500">Đang đồng bộ dữ liệu từ Blockchain...</p>
            </motion.div>
          ) : eventsData.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-32 bg-white border border-gray-200 rounded-2xl shadow-sm"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5"
              >
                <Calendar className="text-orange-500" size={32} />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có sự kiện nào</h2>
              <p className="text-gray-500 mb-8">Hãy là người đầu tiên tạo sự kiện trên VeilTix!</p>
              <Link href="/create" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold text-sm">
                <Plus size={16} /> Tạo sự kiện ngay
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {paginatedEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
                >
                <TiltCard intensity={10} className="h-full">
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden group flex flex-col h-full cursor-default"
                  style={{ boxShadow: "0 4px 20px -6px rgba(0,0,0,0.07)" }}
                >
                  {/* Image */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    {event.image ? (
                      <img src={event.image} alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                      >
                        <Calendar className="text-gray-300" size={40} />
                      </motion.div>
                    )}
                    {event.isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.08 + 0.3, type: "spring" }}
                        className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-full"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Active
                      </motion.div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
                    )}
                    <div className="space-y-2 mb-5 flex-1">
                      {[
                        { icon: Calendar, text: event.date },
                        { icon: MapPin, text: event.location },
                        { icon: Users, text: `${event.sold} / ${event.attendees} vé đã bán` },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2 text-sm text-gray-500">
                          <Icon size={14} className="text-orange-400 flex-shrink-0" />
                          <span className="line-clamp-1">{text}</span>
                        </div>
                      ))}
                    </div>
                    {/* Progress */}
                    <div className="mb-4">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: i * 0.08 + 0.4, duration: 0.7, ease: "easeOut" }}
                          style={{
                            originX: 0,
                            width: `${event.attendees > 0 ? Math.min((event.sold / event.attendees) * 100, 100) : 0}%`
                          }}
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Giá vé</p>
                        <p className="text-orange-500 font-bold text-lg mt-0.5">
                          {event.price === "Free" ? "Miễn phí" : `${event.price} ROSE`}
                        </p>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link href={`/events/${event.id}`}
                          className="px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-semibold shadow-sm shadow-orange-500/20">
                          Xem chi tiết
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
                </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {filteredEvents.length > EVENTS_PER_PAGE && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-col items-center gap-5"
          >
            <p className="text-gray-400 text-sm">Showing {startIndex + 1}–{Math.min(startIndex + EVENTS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length}</p>
            <div className="flex items-center gap-1.5">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-40 shadow-sm">
                <ChevronLeft size={18} />
              </motion.button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <motion.button key={page} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${page === currentPage ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {page}
                </motion.button>
              ))}
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-40 shadow-sm">
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
