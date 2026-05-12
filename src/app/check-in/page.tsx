"use client"

import {
  QrCode, CheckCircle, X, Loader2, ExternalLink, AlertTriangle,
  ChevronRight, Clock, Calendar, MapPin, ShieldCheck, ShieldAlert,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect, useRef, useCallback } from "react"
import { PageBg } from "@/components/ui/page-bg"
import { Html5Qrcode } from "html5-qrcode"
import { useAccount } from "wagmi"
import { verifyMessage } from "viem"
import { useVeilTix } from "@/hooks/use-veiltix"
import { VEILTIX_ABI, CONTRACT_ADDRESS } from "@/config/contract"

interface OrganizerEvent {
  event_id: string
  title: string
  image: string | null
  location: string | null
  start_time: string
  end_time: string
  status: string | null
  sold_tickets: number | null
  total_tickets: number | null
}

interface TicketInfo {
  tokenId: number
  eventId: number
  eventName: string
  organizer: string
  ticketType: number
  isUsed: boolean
  isListed: boolean
  owner: string
  sigVerified: boolean | null
  sigExpired: boolean
}

type Step = "select-event" | "scan" | "result"

function getEventTimeStatus(event: OrganizerEvent): { ok: boolean; label: string; color: string } {
  const now = Date.now()
  const start = new Date(event.start_time).getTime()
  const end = new Date(event.end_time).getTime()
  const windowMs = 2 * 60 * 60 * 1000

  if (event.status === "cancelled") return { ok: false, label: "Sự kiện đã bị huỷ", color: "text-red-500" }
  if (now < start - windowMs) {
    const diffH = Math.ceil((start - now) / 3_600_000)
    return { ok: false, label: `Chưa đến giờ check-in (còn ${diffH}h)`, color: "text-yellow-500" }
  }
  if (now > end) return { ok: false, label: "Sự kiện đã kết thúc", color: "text-red-500" }
  return { ok: true, label: "Đang diễn ra · Check-in khả dụng", color: "text-green-500" }
}

export default function CheckInPage() {
  const { address } = useAccount()
  const { checkInTicket, publicClient } = useVeilTix()

  const [step, setStep] = useState<Step>("select-event")
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<OrganizerEvent | null>(null)

  const [isScanning, setIsScanning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [manualTokenId, setManualTokenId] = useState("")
  const [manualSig, setManualSig] = useState("")
  const [manualExp, setManualExp] = useState("")
  const [showSigInput, setShowSigInput] = useState(false)

  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null)
  const [loadingTicket, setLoadingTicket] = useState(false)
  const [ticketError, setTicketError] = useState<string | null>(null)

  const [checkingIn, setCheckingIn] = useState(false)
  const [checkInHash, setCheckInHash] = useState<string | null>(null)
  const [checkInError, setCheckInError] = useState<string | null>(null)
  const [manualConfirmed, setManualConfirmed] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || window.innerWidth <= 768
    )
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => () => {
    scannerRef.current?.stop().catch(() => {}).finally(() => {
      scannerRef.current?.clear(); scannerRef.current = null
    })
  }, [])

  useEffect(() => {
    if (!address) return
    setLoadingEvents(true)
    fetch(`/api/events?organizer=${address}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEvents(data) })
      .catch(console.error)
      .finally(() => setLoadingEvents(false))
  }, [address])

  useEffect(() => {
    if (!isScanning || !isMobile || scannerRef.current) return
    const html5QrCode = new Html5Qrcode("qr-reader")
    scannerRef.current = html5QrCode
    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } },
      (decoded) => {
        setIsScanning(false)
        html5QrCode.stop().catch(() => {}).finally(() => { html5QrCode.clear(); scannerRef.current = null })
        lookupTicket(decoded)
      }, () => {}
    ).catch(() => { setIsScanning(false); scannerRef.current = null })
  }, [isScanning, isMobile])

  const stopScanning = () => {
    setIsScanning(false)
    scannerRef.current?.stop().catch(() => {}).finally(() => {
      scannerRef.current?.clear(); scannerRef.current = null
    })
  }

  const lookupTicket = useCallback(async (rawValue: string) => {
    if (!publicClient || !selectedEvent) return
    setLoadingTicket(true); setTicketError(null); setTicketInfo(null)
    setCheckInHash(null); setCheckInError(null); setManualConfirmed(false)
    setStep("result")

    let tokenId: number | null = null
    let sigFromQr: string | null = null
    let expFromQr: number | null = null

    const plain = rawValue.trim()
    if (/^\d+$/.test(plain)) {
      tokenId = parseInt(plain)
    } else {
      try {
        const qStr = plain.includes("?") ? plain.split("?")[1] : plain
        const p = new URLSearchParams(qStr)
        if (p.get("tokenId")) tokenId = parseInt(p.get("tokenId")!)
        if (p.get("sig")) sigFromQr = p.get("sig")
        if (p.get("exp")) expFromQr = parseInt(p.get("exp")!)
      } catch {
        const m = plain.match(/tokenId=(\d+)/) || plain.match(/veiltix:(\d+)/)
        if (m) tokenId = parseInt(m[1])
      }
    }

    if (tokenId === null || isNaN(tokenId)) {
      setTicketError(`Mã QR không hợp lệ: "${rawValue}"`)
      setLoadingTicket(false)
      return
    }

    try {
      const [ticket, owner, tokenListingRaw] = await Promise.all([
        publicClient.readContract({ address: CONTRACT_ADDRESS, abi: VEILTIX_ABI, functionName: "getTicket", args: [BigInt(tokenId)] }) as Promise<{ eventId: bigint; ticketType: number; isUsed: boolean }>,
        publicClient.readContract({ address: CONTRACT_ADDRESS, abi: VEILTIX_ABI, functionName: "ownerOf", args: [BigInt(tokenId)] }) as Promise<string>,
        publicClient.readContract({ address: CONTRACT_ADDRESS, abi: VEILTIX_ABI, functionName: "tokenListing", args: [BigInt(tokenId)] }) as Promise<bigint>,
      ])

      const eventId = Number(ticket.eventId)
      if (eventId.toString() !== selectedEvent.event_id) {
        setTicketError(`Vé #${tokenId} thuộc sự kiện #${eventId}, không phải "${selectedEvent.title}".`)
        setLoadingTicket(false)
        return
      }

      let isListed = false
      const storedListing = Number(tokenListingRaw)
      if (storedListing > 0) {
        try {
          const listing = await publicClient.readContract({ address: CONTRACT_ADDRESS, abi: VEILTIX_ABI, functionName: "getListing", args: [BigInt(storedListing - 1)] }) as { active: boolean }
          isListed = listing.active
        } catch { /* ignore */ }
      }

      const ev = await publicClient.readContract({ address: CONTRACT_ADDRESS, abi: VEILTIX_ABI, functionName: "getEvent", args: [BigInt(eventId)] }) as { name: string; organizer: string }

      let sigVerified: boolean | null = null
      let sigExpired = false
      if (sigFromQr && expFromQr) {
        const nowSec = Math.floor(Date.now() / 1000)
        if (nowSec > expFromQr) { sigExpired = true; sigVerified = false }
        else {
          try {
            const message = `VeilTix Check-in\nToken: ${tokenId}\nExpires: ${expFromQr}`
            sigVerified = await verifyMessage({ address: owner as `0x${string}`, message, signature: sigFromQr as `0x${string}` })
          } catch { sigVerified = false }
        }
      }

      setTicketInfo({ tokenId, eventId, eventName: ev?.name || selectedEvent.title, organizer: ev?.organizer || "", ticketType: ticket.ticketType, isUsed: ticket.isUsed, isListed, owner, sigVerified, sigExpired })
    } catch (err: any) {
      setTicketError("Không tìm thấy vé #" + tokenId + ": " + (err?.shortMessage || err?.message || "Token không hợp lệ"))
    } finally {
      setLoadingTicket(false)
    }
  }, [publicClient, selectedEvent])

  const handleCheckIn = async () => {
    if (!ticketInfo) return
    setCheckingIn(true); setCheckInError(null)
    try {
      const { hash } = await checkInTicket(ticketInfo.tokenId)
      setCheckInHash(hash)
      await fetch("/api/tickets/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tokenId: ticketInfo.tokenId, txHash: hash }) })
      setTicketInfo(prev => prev ? { ...prev, isUsed: true } : prev)
    } catch (err: any) {
      setCheckInError(err?.shortMessage || err?.message || "Check-in thất bại")
    } finally {
      setCheckingIn(false)
    }
  }

  const isOrganizer = !!(ticketInfo && address && ticketInfo.organizer.toLowerCase() === address.toLowerCase())

  const getBlockReason = (t: TicketInfo): string | null => {
    if (t.isUsed) return "Vé đã được sử dụng."
    if (t.isListed) return "Vé đang rao bán — phải hủy bán trước khi check-in."
    if (!isOrganizer) return "Chỉ ban tổ chức của sự kiện này mới có quyền check-in."
    const evStatus = selectedEvent ? getEventTimeStatus(selectedEvent) : null
    if (evStatus && !evStatus.ok) return evStatus.label
    return null
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
          <QrCode size={32} className="text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Kết nối ví để tiếp tục</h2>
        <p className="text-gray-500 text-sm">Chức năng check-in dành cho ban tổ chức sự kiện.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBg variant="checkin" />
      <style dangerouslySetInnerHTML={{ __html: `@keyframes scan { 0%,100%{transform:translateY(0)} 50%{transform:translateY(218px)} }` }} />

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-3xl mx-auto px-6 py-10">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight"
          >
            Check-in System
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-500 text-sm">
            Xác minh vé NFT · Oasis Sapphire Testnet
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
        {/* Step 1: Select event */}
        {step === "select-event" && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-gray-600 text-sm mb-5 font-medium">Chọn sự kiện bạn muốn check-in:</p>

            {loadingEvents ? (
              <div className="flex items-center gap-3 text-gray-400 py-10">
                <Loader2 size={20} className="animate-spin text-orange-500" /> Đang tải sự kiện...
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar size={22} className="text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm mb-2">Bạn chưa tạo sự kiện nào.</p>
                <a href="/create" className="text-orange-500 hover:underline text-sm font-medium">Tạo sự kiện →</a>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((ev, i) => {
                  const evStatus = getEventTimeStatus(ev)
                  const imgUrl = ev.image
                    ? ev.image.startsWith("http") ? ev.image : `https://ipfs.io/ipfs/${ev.image}`
                    : null
                  return (
                    <motion.button
                      key={ev.event_id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.35 }}
                      whileHover={{ scale: 1.01, boxShadow: "0 8px 24px -8px rgba(0,0,0,0.1)" }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { setSelectedEvent(ev); setStep("scan") }}
                      className="w-full text-left bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        {imgUrl
                          ? <img src={imgUrl} alt={ev.title} className="w-full h-full object-cover" />
                          : <QrCode size={20} className="text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-semibold truncate">{ev.title}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-gray-400 text-xs">
                            <Calendar size={10} />
                            {new Date(ev.start_time).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1 text-gray-400 text-xs">
                              <MapPin size={10} /> {ev.location}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 font-medium ${evStatus.color}`}>
                          <Clock size={10} className="inline mr-1" />{evStatus.label}
                        </p>
                        <p className="text-gray-300 text-xs">{ev.sold_tickets ?? 0}/{ev.total_tickets ?? "?"} vé đã bán</p>
                      </div>
                      <ChevronRight className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" size={18} />
                    </motion.button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Scan / manual */}
        {step === "scan" && selectedEvent && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            {/* Event badge */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-orange-400 text-xs font-medium">Đang check-in cho</p>
                <p className="text-gray-900 font-semibold truncate">{selectedEvent.title}</p>
                <p className={`text-xs font-medium ${getEventTimeStatus(selectedEvent).color}`}>
                  {getEventTimeStatus(selectedEvent).label}
                </p>
              </div>
              <button
                onClick={() => { setSelectedEvent(null); setStep("select-event"); setTicketInfo(null); setTicketError(null) }}
                className="text-gray-400 hover:text-gray-600 text-xs font-medium flex-shrink-0 transition-colors"
              >
                Đổi sự kiện
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              {/* Camera scanner */}
              <div className="aspect-square max-w-xs mx-auto bg-gray-50 rounded-2xl border border-gray-200 relative overflow-hidden mb-5 flex items-center justify-center">
                {isScanning ? (
                  <div className="w-full h-full relative">
                    <div id="qr-reader" className="w-full h-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] pointer-events-none z-10 overflow-hidden">
                      <div className="w-full h-[2px] bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                        style={{ animation: "scan 2.5s ease-in-out infinite" }} />
                    </div>
                    <button onClick={stopScanning}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-xl p-2 z-20 shadow-sm">
                      <X className="text-gray-600" size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center cursor-pointer select-none p-6"
                    onClick={() => isMobile && setIsScanning(true)}>
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <QrCode className="text-orange-500" size={28} />
                    </div>
                    {isMobile
                      ? <p className="text-orange-500 text-sm font-medium">Tap để quét QR</p>
                      : <p className="text-gray-400 text-xs">Camera scan chỉ hỗ trợ trên mobile</p>}
                  </div>
                )}
              </div>

              {/* Manual input */}
              <p className="text-gray-400 text-xs text-center mb-3 font-medium">Hoặc nhập thủ công</p>
              <div className="flex gap-2">
                <input
                  type="number" min="0" value={manualTokenId}
                  onChange={e => setManualTokenId(e.target.value)}
                  placeholder="Token ID (ví dụ: 42)"
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition placeholder-gray-400"
                  onKeyDown={e => {
                    if (e.key === "Enter" && manualTokenId.trim()) {
                      const val = manualSig.trim() && manualExp.trim()
                        ? `veiltix://checkin?tokenId=${manualTokenId.trim()}&exp=${manualExp.trim()}&sig=${manualSig.trim()}`
                        : manualTokenId.trim()
                      lookupTicket(val)
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (!manualTokenId.trim()) return
                    const val = manualSig.trim() && manualExp.trim()
                      ? `veiltix://checkin?tokenId=${manualTokenId.trim()}&exp=${manualExp.trim()}&sig=${manualSig.trim()}`
                      : manualTokenId.trim()
                    lookupTicket(val)
                  }}
                  disabled={!manualTokenId.trim() || loadingTicket}
                  className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-40 transition-colors shadow-sm shadow-orange-500/20"
                >
                  Kiểm tra
                </button>
              </div>

              <button
                onClick={() => setShowSigInput(prev => !prev)}
                className="mt-3 flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-xs font-medium mx-auto transition-colors"
              >
                <ShieldCheck size={12} />
                {showSigInput ? "Ẩn nhập chữ ký" : "Có chữ ký? Nhập để xác minh →"}
              </button>

              {showSigInput && (
                <div className="mt-3 space-y-2 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-gray-400 text-xs mb-2">Dán chữ ký và thời gian hết hạn từ QR của người tham dự.</p>
                  <input
                    type="text" value={manualSig} onChange={e => setManualSig(e.target.value)}
                    placeholder="Chữ ký (0x...)"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 text-xs font-mono focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition"
                  />
                  <input
                    type="text" value={manualExp} onChange={e => setManualExp(e.target.value)}
                    placeholder="Expiry (unix timestamp)"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 text-xs font-mono focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition"
                  />
                  {manualSig.trim() && manualExp.trim() && (
                    <p className="text-green-500 text-xs flex items-center gap-1">
                      <ShieldCheck size={10} /> Chữ ký sẽ được xác minh khi bấm &quot;Kiểm tra&quot;
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Result */}
        {step === "result" && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            <motion.button
              whileHover={{ x: -3 }}
              onClick={() => { setStep("scan"); setTicketInfo(null); setTicketError(null); setCheckInHash(null); setManualTokenId(""); setManualSig(""); setManualExp(""); setShowSigInput(false); setManualConfirmed(false) }}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
            >
              ← Quét vé khác
            </motion.button>

            {/* Loading */}
            {loadingTicket && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center gap-3 shadow-sm"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 size={32} className="text-orange-500" />
                </motion.div>
                <p className="text-gray-500 text-sm">Đang tra cứu trên blockchain...</p>
              </motion.div>
            )}

            {/* Error */}
            {ticketError && !loadingTicket && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
                <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-red-600 font-semibold text-sm">Lỗi tra cứu vé</p>
                  <p className="text-red-500/80 text-sm mt-1">{ticketError}</p>
                </div>
              </div>
            )}

            {/* Success after check-in */}
            {checkInHash && ticketInfo && (
              <div className="bg-white border border-green-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 bg-green-50 flex items-center gap-2 border-b border-green-100">
                  <CheckCircle className="text-green-500" size={18} />
                  <span className="text-green-700 font-bold text-sm">Check-in thành công!</span>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400 text-xs">Token ID</p>
                      <p className="text-gray-900 font-mono font-bold">#{ticketInfo.tokenId}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Sự kiện</p>
                      <p className="text-gray-900">{ticketInfo.eventName}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 text-xs">Chủ vé</p>
                      <p className="text-gray-600 font-mono text-xs break-all">{ticketInfo.owner}</p>
                    </div>
                  </div>
                  <a href={`https://testnet.explorer.sapphire.oasis.dev/tx/${checkInHash}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-green-500 text-xs hover:text-green-600 mt-2">
                    Xem giao dịch <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            )}

            {/* Ticket info (before check-in) */}
            {ticketInfo && !loadingTicket && !checkInHash && (() => {
              const blockReason = getBlockReason(ticketInfo)
              const canCheckIn = !blockReason
              return (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Status banner */}
                  <div className={`px-5 py-3 flex items-center gap-2 border-b ${
                    ticketInfo.isUsed ? "bg-red-50 border-red-100" :
                    ticketInfo.isListed ? "bg-yellow-50 border-yellow-100" :
                    canCheckIn ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"
                  }`}>
                    {ticketInfo.isUsed ? (
                      <><X className="text-red-500" size={18} /><span className="text-red-600 font-bold text-sm">Vé đã được sử dụng</span></>
                    ) : ticketInfo.isListed ? (
                      <><AlertTriangle className="text-yellow-500" size={18} /><span className="text-yellow-700 font-bold text-sm">Vé đang rao bán — không thể check-in</span></>
                    ) : canCheckIn ? (
                      <><CheckCircle className="text-green-500" size={18} /><span className="text-green-700 font-bold text-sm">Vé hợp lệ · Sẵn sàng check-in</span></>
                    ) : (
                      <><AlertTriangle className="text-orange-500" size={18} /><span className="text-orange-600 font-bold text-sm">Không thể check-in</span></>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs">Token ID</p>
                        <p className="text-gray-900 font-mono font-bold text-lg">#{ticketInfo.tokenId}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Loại vé</p>
                        <p className="text-gray-700">{ticketInfo.ticketType === 0 ? "Standard" : `Type ${ticketInfo.ticketType}`}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-400 text-xs">Sự kiện</p>
                        <p className="text-gray-900 font-semibold">{ticketInfo.eventName}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-400 text-xs">Chủ vé</p>
                        <p className="text-gray-500 font-mono text-xs break-all">{ticketInfo.owner}</p>
                      </div>
                    </div>

                    {/* Signature badge */}
                    {ticketInfo.sigVerified !== null && (
                      <div className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                        ticketInfo.sigExpired ? "bg-yellow-50 border border-yellow-200" :
                        ticketInfo.sigVerified ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                      }`}>
                        {ticketInfo.sigExpired ? (
                          <><AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={14} />
                            <div><p className="text-yellow-700 font-semibold">QR đã hết hạn</p><p className="text-yellow-600/70 mt-0.5">Yêu cầu người dùng tạo lại QR mới từ profile.</p></div></>
                        ) : ticketInfo.sigVerified ? (
                          <><ShieldCheck className="text-green-500 flex-shrink-0 mt-0.5" size={14} />
                            <div><p className="text-green-700 font-semibold">Chữ ký hợp lệ</p><p className="text-green-600/70 mt-0.5">QR được ký bởi chủ vé.</p></div></>
                        ) : (
                          <><ShieldAlert className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
                            <div><p className="text-red-600 font-semibold">Chữ ký không hợp lệ</p><p className="text-red-500/70 mt-0.5">QR không được ký bởi chủ vé. Có thể bị giả mạo.</p></div></>
                        )}
                      </div>
                    )}

                    {ticketInfo.sigVerified === null && (
                      <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200 space-y-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={14} />
                          <div>
                            <p className="text-yellow-700 font-semibold text-xs">Không có chữ ký — nhập thủ công</p>
                            <p className="text-yellow-600/70 text-xs mt-0.5">Nếu dùng thủ công, bạn phải tự xác minh người dùng.</p>
                          </div>
                        </div>
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox" checked={manualConfirmed}
                            onChange={e => setManualConfirmed(e.target.checked)}
                            className="mt-0.5 accent-orange-500 w-4 h-4 flex-shrink-0"
                          />
                          <span className="text-gray-600 text-xs leading-relaxed">
                            Tôi đã xác nhận{" "}
                            <span className="text-gray-900 font-mono">{ticketInfo.owner.slice(0, 8)}...{ticketInfo.owner.slice(-6)}</span>
                            {" "}là chủ vé.
                          </span>
                        </label>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-4">
                      {blockReason && (
                        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                          <p className="text-gray-600 text-xs">{blockReason}</p>
                        </div>
                      )}

                      {canCheckIn && (() => {
                        const invalidSig = ticketInfo.sigVerified === false && !ticketInfo.sigExpired
                        const needsManualConfirm = ticketInfo.sigVerified === null && !manualConfirmed
                        const isDisabled = checkingIn || invalidSig || needsManualConfirm
                        return (
                          <>
                            <button
                              onClick={handleCheckIn} disabled={isDisabled}
                              className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20"
                            >
                              {checkingIn
                                ? <><Loader2 size={18} className="animate-spin" /> Đang ghi lên blockchain...</>
                                : <><CheckCircle size={18} /> Xác nhận Check-in</>}
                            </button>
                            {invalidSig && (
                              <p className="text-red-500 text-xs text-center mt-2">Chữ ký không hợp lệ — yêu cầu người dùng tạo QR mới.</p>
                            )}
                            {needsManualConfirm && (
                              <p className="text-yellow-600 text-xs text-center mt-2">Tick xác nhận ở trên để mở khoá nút check-in.</p>
                            )}
                          </>
                        )
                      })()}

                      {checkInError && <p className="text-red-500 text-sm mt-2">{checkInError}</p>}
                    </div>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  )
}
