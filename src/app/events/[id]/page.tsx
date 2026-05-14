"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, MapPin, Ticket, Loader2, ArrowLeft, CheckCircle, Users, ExternalLink } from "lucide-react"
import { PageBg } from "@/components/ui/page-bg"
import { formatEther, parseEventLogs } from "viem"
import Link from "next/link"
import { useVeilTix } from "@/hooks/use-veiltix"
import { VEILTIX_ABI } from "@/config/contract"
import { getEventById } from "@/actions/event-details-actions"
import { useWallet } from "@/components/context/walletContext"

interface DetailedEvent {
  id: number
  title: string
  date: string
  location: string
  attendees: number
  sold: number
  price: string
  priceRaw: bigint
  isActive: boolean
  image: string | null
  description: string
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = Number(params.id)

  const { buyTicket } = useVeilTix()
  const { address } = useWallet()

  const [eventData, setEventData] = useState<DetailedEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBuying, setIsBuying] = useState(false)
  const [buySuccess, setBuySuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const fetchEvent = useCallback(async () => {
    setIsLoading(true)
    try {
      const dbEvent = await getEventById(eventId)
      if (!dbEvent) { setEventData(null); return }

      let imageUrl = dbEvent.image;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob')) {
        imageUrl = `https://ipfs.io/ipfs/${imageUrl}`;
      }

      let displayPrice = "Free";
      let priceWei = BigInt(0);
      if (dbEvent.price && dbEvent.price !== "0") {
        priceWei = BigInt(dbEvent.price);
        displayPrice = formatEther(priceWei);
      }

      setEventData({
        id: Number(dbEvent.event_id),
        title: dbEvent.title,
        date: new Date(dbEvent.start_time).toLocaleString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        location: dbEvent.location || "On-chain Event",
        attendees: dbEvent.total_tickets || 0,
        sold: dbEvent.sold_tickets || 0,
        price: displayPrice,
        priceRaw: priceWei,
        isActive: dbEvent.status === "active",
        image: imageUrl || null,
        description: dbEvent.description || ""
      })
    } catch (err) {
      console.error("Error fetching event details:", err)
      setEventData(null)
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => { fetchEvent() }, [fetchEvent])

  const handleBuyTicket = async () => {
    if (!eventData) return
    try {
      setIsBuying(true); setBuySuccess(false)
      const { hash, receipt } = await buyTicket(eventData.id, 0, eventData.priceRaw)

      let tokenId: number | undefined
      if (receipt) {
        try {
          const logs = parseEventLogs({ abi: VEILTIX_ABI as any, logs: receipt.logs })
          const purchasedLog = logs.find((l: any) => l.eventName === "TicketPurchased")
          if (purchasedLog) {
            tokenId = Number((purchasedLog as any).args.tokenId)
          }
        } catch (e) {
          console.warn("Could not parse TicketPurchased log", e)
        }
      }

      if (address) {
        const buyRes = await fetch('/api/transactions/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: eventData.id, txHash: hash, walletAddress: address, tokenId })
        })
        if (!buyRes.ok) {
          const err = await buyRes.json().catch(() => ({}))
          console.error("[BUY] DB route error:", err)
          alert(`Giao dịch on-chain thành công nhưng lưu DB thất bại: ${err?.detail || err?.error || "Lỗi không xác định"}`)
        }
      }

      setTxHash(hash)
      setBuySuccess(true)
      fetchEvent()
    } catch (error: any) {
      console.error(error)
      alert(`Lỗi mua vé: ${error.message || "Thao tác thất bại"}`)
    } finally {
      setIsBuying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin text-orange-500" size={40} />
          <p>Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 pt-20">
        <h2 className="text-2xl font-bold text-gray-900">Sự kiện không tồn tại</h2>
        <button onClick={() => router.push('/events')} className="inline-flex items-center gap-2 text-orange-500 hover:underline font-medium">
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
      </div>
    )
  }

  const isSoldOut = eventData.sold >= eventData.attendees
  const soldPct = eventData.attendees > 0 ? Math.min((eventData.sold / eventData.attendees) * 100, 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBg variant="events" />
      {/* Banner */}
      <div className="relative w-full h-72 md:h-96 bg-gray-200 overflow-hidden">
        {eventData.image ? (
          <img src={eventData.image} alt={eventData.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <Calendar className="text-orange-300" size={80} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full px-6 pb-6">
          <Link href="/events" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-3 transition-colors">
            <ArrowLeft size={14} /> Quay lại
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{eventData.title}</h1>
          {eventData.isActive && (
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Active
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Giới thiệu sự kiện</h2>
              <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                {eventData.description || "Chưa có mô tả cho sự kiện này."}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin chi tiết</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Thời gian</h3>
                    <p className="text-gray-500 text-sm">{eventData.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Địa điểm</h3>
                    <p className="text-gray-500 text-sm">{eventData.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Vé đã bán</h3>
                    <p className="text-gray-500 text-sm">{eventData.sold} / {eventData.attendees} vé</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Ticket size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Event ID</h3>
                    <p className="text-gray-500 text-sm font-mono">#{eventData.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Panel */}
          <div className="md:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Ticket size={18} className="text-orange-500" />
                Thông tin vé
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Giá vé</span>
                  <span className="text-2xl font-bold text-orange-500">
                    {eventData.price === "Free" ? "Miễn phí" : `${eventData.price} ROSE`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Còn lại</span>
                  <span className="text-gray-900 font-semibold">{eventData.attendees - eventData.sold} vé</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>{eventData.sold} đã bán</span>
                    <span>{eventData.attendees} tổng</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                      style={{ width: `${soldPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {buySuccess && txHash && (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <CheckCircle className="text-green-500 mx-auto mb-2" size={28} />
                  <p className="text-green-700 font-bold text-sm mb-1">Giao dịch thành công!</p>
                  <a href={`https://testnet.explorer.sapphire.oasis.dev/tx/${txHash}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
                    Xem trên Explorer <ExternalLink size={10} />
                  </a>
                </div>
              )}

              <button
                onClick={handleBuyTicket}
                disabled={isBuying || isSoldOut}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20"
              >
                {isBuying ? (
                  <><Loader2 className="animate-spin" size={20} /> Đang xử lý...</>
                ) : isSoldOut ? (
                  "Đã hết vé"
                ) : (
                  "Mua vé ngay"
                )}
              </button>

              {isSoldOut && (
                <p className="text-center text-gray-400 text-xs mt-3">
                  Tất cả vé đã được bán.{" "}
                  <Link href="/market" className="text-orange-500 hover:underline">Xem marketplace →</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
