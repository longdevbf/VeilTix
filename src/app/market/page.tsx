"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  TrendingUp, BarChart3, Tag, X, Loader2, ExternalLink,
  RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, ShoppingBag, Users,
} from "lucide-react"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import { useVeilTix } from "@/hooks/use-veiltix"
import Link from "next/link"
import { PageBg } from "@/components/ui/page-bg"
import { TiltCard } from "@/components/ui/tilt-card"
import { TicketStack, RoseCoin } from "@/components/ui/scene-3d"

interface ListingInfo {
  listingId: number; contractListingId: number; tokenId: number; seller: string;
  price: bigint; eventName: string; eventImage: string; eventId: number;
}

type SortKey = "price-asc" | "price-desc" | "latest"

export default function MarketPage() {
  const { address } = useAccount()
  const { buyListedTicket } = useVeilTix()

  const [listings, setListings] = useState<ListingInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [buyingId, setBuyingId] = useState<number | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>("latest")

  const loadListings = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/listings?status=active")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: any[] = await res.json()
      setListings(data.map(l => ({
        listingId: parseInt(l.listing_id),
        contractListingId: parseInt(l.contract_listing_id),
        tokenId: parseInt(l.token_id),
        seller: l.seller_wallet,
        price: BigInt(l.price),
        eventName: l.event_name,
        eventImage: l.event_image
          ? (l.event_image.startsWith("http") ? l.event_image : `https://ipfs.io/ipfs/${l.event_image}`)
          : "",
        eventId: parseInt(l.event_id),
      })))
    } catch (err: any) {
      setError("Không thể tải listings: " + (err?.message || ""))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadListings() }, [loadListings])

  const handleBuy = async (listing: ListingInfo) => {
    if (!address) { setError("Vui lòng kết nối ví."); return }
    if (listing.seller.toLowerCase() === address.toLowerCase()) { setError("Không thể mua vé của chính mình."); return }
    setError(null); setTxHash(null); setBuyingId(listing.contractListingId)
    try {
      const { hash } = await buyListedTicket(listing.contractListingId, listing.price)
      setTxHash(hash)
      await fetch('/api/listings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractListingId: listing.contractListingId, status: 'sold', buyerWallet: address, soldTxHash: hash }),
      })
      setListings(prev => prev.filter(l => l.contractListingId !== listing.contractListingId))
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Giao dịch thất bại")
    } finally {
      setBuyingId(null)
    }
  }

  const totalVolume = listings.reduce((s, l) => s + l.price, BigInt(0))
  const floorPrice = listings.length
    ? listings.reduce((min, l) => l.price < min ? l.price : min, listings[0].price)
    : BigInt(0)

  const sorted = [...listings].sort((a, b) => {
    if (sort === "price-asc") return Number(a.price - b.price)
    if (sort === "price-desc") return Number(b.price - a.price)
    return b.listingId - a.listingId // latest first
  })

  const isMine = (seller: string) =>
    !!address && seller.toLowerCase() === address.toLowerCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBg variant="market" grid />

      {/* ── Hero header ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white border-b border-gray-200 overflow-hidden"
      >
        {/* Decorative gradient strip */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag size={22} className="text-orange-500" />
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                  Ticket Marketplace
                </h1>
              </div>
              <p className="text-gray-500">Secondary market · Verified NFT tickets · Oasis Sapphire</p>
            </div>

            {/* 3D decoration */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0" style={{ perspective: 800 }}>
              <div className="opacity-85"><TicketStack /></div>
              <div className="flex flex-col gap-2 items-center">
                <RoseCoin size={44} delay={0.2} />
                <RoseCoin size={32} delay={0.9} />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={loadListings} disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 shadow-sm font-medium transition-colors"
              >
                <motion.div animate={loading ? { rotate: 360 } : {}} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                  <RefreshCw size={15} />
                </motion.div>
                Refresh
              </motion.button>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href="/profile"
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20">
                  <Tag size={15} /> List My Ticket
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: BarChart3, label: "Total Listings", value: loading ? "—" : `${listings.length}`, color: "text-blue-500 bg-blue-50" },
              { icon: TrendingUp, label: "Volume Listed", value: loading ? "—" : `${parseFloat(formatEther(totalVolume)).toFixed(2)} ROSE`, color: "text-green-500 bg-green-50" },
              { icon: ArrowDown, label: "Floor Price", value: listings.length && !loading ? `${parseFloat(formatEther(floorPrice)).toFixed(4)} ROSE` : "—", color: "text-orange-500 bg-orange-50" },
              { icon: Users, label: "Royalty Rate", value: "5% → Creator", color: "text-purple-500 bg-purple-50" },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3"
                >
                  <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-medium truncate">{s.label}</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{s.value}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
              <X className="text-red-500 flex-shrink-0" size={16} />
              <p className="text-red-600 text-sm flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 p-1"><X size={14} /></button>
            </motion.div>
          )}
          {txHash && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
              <p className="text-green-700 text-sm font-semibold mb-1">✓ Mua vé thành công!</p>
              <a href={`https://testnet.explorer.sapphire.oasis.dev/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-green-600 text-xs hover:text-green-700">
                Xem giao dịch trên Explorer <ExternalLink size={11} />
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort bar */}
        {!loading && listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide mr-1">Sort</span>
            {(["latest", "price-asc", "price-desc"] as SortKey[]).map((k) => {
              const labels: Record<SortKey, { label: string; icon: typeof ArrowUpDown }> = {
                latest:      { label: "Recently Listed", icon: ArrowUpDown },
                "price-asc": { label: "Price: Low → High", icon: ArrowUp },
                "price-desc":{ label: "Price: High → Low", icon: ArrowDown },
              }
              const { label, icon: Icon } = labels[k]
              return (
                <motion.button
                  key={k}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSort(k)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    sort === k
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </motion.button>
              )
            })}
            <span className="ml-auto text-xs text-gray-400">{listings.length} listing{listings.length !== 1 ? "s" : ""}</span>
          </motion.div>
        )}

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            /* Loading skeleton */
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-5 bg-gray-100 rounded w-2/3 mt-3" />
                    <div className="h-9 bg-gray-100 rounded-xl mt-3" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : listings.length === 0 ? (
            /* Empty state */
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-28 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6"
              >
                <ShoppingBag size={36} className="text-orange-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">
                Be the first to list your ticket. Buy from the{" "}
                <Link href="/events" className="text-orange-500 hover:underline font-medium">events page</Link>
                {" "}then list it here.
              </p>
              <Link href="/profile"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold text-sm shadow-sm shadow-orange-500/20">
                <Tag size={15} /> List a Ticket
              </Link>
            </motion.div>
          ) : (
            /* Cards grid */
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sorted.map((listing, i) => (
                <motion.div
                  key={listing.contractListingId}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  layout
                >
                <TiltCard intensity={12} className="h-full">
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col h-full group cursor-default"
                  style={{ boxShadow: "0 4px 20px -6px rgba(0,0,0,0.07)" }}
                >
                  {/* Image */}
                  <div className="relative h-44 bg-gray-100 overflow-hidden flex-shrink-0">
                    {listing.eventImage ? (
                      <img
                        src={listing.eventImage}
                        alt={listing.eventName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
                        >
                          <Tag size={32} className="text-gray-300" />
                        </motion.div>
                      </div>
                    )}

                    {/* Token ID badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-mono font-semibold">
                      #{listing.tokenId}
                    </div>

                    {/* "Mine" badge */}
                    {isMine(listing.seller) && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-lg">
                        YOURS
                      </div>
                    )}

                    {/* Gradient overlay at bottom */}
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                    <p className="absolute bottom-2 left-3 right-3 text-white text-xs font-semibold truncate leading-tight">
                      {listing.eventName}
                    </p>
                  </div>

                  {/* Card body */}
                  <div className="p-3.5 flex flex-col flex-1 gap-3">
                    {/* Seller */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Seller</p>
                        <p className="text-xs font-mono text-gray-600">
                          {listing.seller.slice(0, 6)}…{listing.seller.slice(-4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">You receive</p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          {parseFloat(formatEther(listing.price * BigInt(925) / BigInt(1000))).toFixed(4)} R
                        </p>
                      </div>
                    </div>

                    {/* Fee breakdown (subtle) */}
                    <div className="bg-gray-50 rounded-xl px-3 py-2 text-[10px] text-gray-400 space-y-0.5">
                      <div className="flex justify-between"><span>Royalty (5%)</span><span>→ Organizer</span></div>
                      <div className="flex justify-between"><span>Platform (2.5%)</span><span>→ VeilTix</span></div>
                    </div>

                    {/* Price + Buy */}
                    <div className="mt-auto">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Price</p>
                      <p className="text-xl font-bold text-gray-900 mb-3">
                        {parseFloat(formatEther(listing.price)).toFixed(4)}
                        <span className="text-sm font-semibold text-orange-500 ml-1">ROSE</span>
                      </p>

                      {isMine(listing.seller) ? (
                        <div className="w-full py-2.5 bg-gray-100 text-gray-400 rounded-xl text-sm font-semibold text-center">
                          Your listing
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleBuy(listing)}
                          disabled={buyingId === listing.contractListingId}
                          className="w-full py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20"
                        >
                          {buyingId === listing.contractListingId
                            ? <><Loader2 size={14} className="animate-spin" /> Buying…</>
                            : "Buy Now"}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
                </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info strip */}
        {!loading && listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 grid md:grid-cols-3 gap-4"
          >
            {[
              { title: "Giá minh bạch", desc: "Giá niêm yết trực tiếp on-chain, không bên thứ ba can thiệp." },
              { title: "Royalty 5%", desc: "Mỗi lần mua bán secondary, ban tổ chức nhận 5% giá trị giao dịch." },
              { title: "Thanh toán tức thì", desc: "Vé & tiền chuyển ngay khi giao dịch được xác nhận trên Oasis." },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{f.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
