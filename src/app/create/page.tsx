"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Upload, Users, DollarSign, ArrowRight, Loader2, CheckCircle, MapPin, Calendar, Ticket, Plus, Trash2, Tag } from "lucide-react"
import { PageBg } from "@/components/ui/page-bg"
import { TiltCard } from "@/components/ui/tilt-card"
import { parseEther, parseEventLogs } from "viem"
import { useVeilTix } from "@/hooks/use-veiltix"
import { useRouter } from "next/navigation"
import { usePublicClient } from "wagmi"
import { VEILTIX_ABI, CONTRACT_ADDRESS } from "@/config/contract"
import { useWallet } from "@/components/context/walletContext"
import dynamic from "next/dynamic"

const MapLocationPicker = dynamic(
  () => import("@/components/ui/map-location-picker"),
  { ssr: false, loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div> }
)

interface TicketTier {
  name: string
  price: string
  supply: string
}

export default function CreatePage() {
  const router = useRouter()
  const { createEvent } = useVeilTix()
  const publicClient = usePublicClient()
  const { address } = useWallet()

  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    eventTime: "",
    location: "",
    description: "",
    image: null as File | null,
  })

  const [tiers, setTiers] = useState<TicketTier[]>([
    { name: "Standard", price: "", supply: "" },
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleLocationSelect = (addr: string) => {
    setFormData(prev => ({ ...prev, location: addr }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = (event) => setUploadedImage(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleTierChange = (index: number, field: keyof TicketTier, value: string) => {
    setTiers(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }

  const addTier = () => {
    if (tiers.length >= 8) return
    setTiers(prev => [...prev, { name: "", price: "", supply: "" }])
  }

  const removeTier = (index: number) => {
    if (tiers.length <= 1) return
    setTiers(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.image) {
      alert("Please upload an event cover image")
      return
    }
    for (const t of tiers) {
      if (!t.name.trim() || !t.price || !t.supply) {
        alert("Please fill in all ticket tier fields (name, price, supply).")
        return
      }
    }
    setIsSubmitting(true)
    try {
      setStatusMessage("Uploading image to IPFS...")
      const uploadData = new FormData()
      uploadData.append("file", formData.image)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData })
      if (!uploadRes.ok) throw new Error("Failed to upload image to IPFS")
      const { ipfsHash } = await uploadRes.json()

      setStatusMessage("Please confirm transaction in your wallet...")
      const dateTime = new Date(`${formData.eventDate}T${formData.eventTime}`).getTime() / 1000
      const eventTime = BigInt(Math.floor(dateTime))

      const tierPrices = tiers.map(t => parseEther(t.price || "0"))
      const tierMaxSupplies = tiers.map(t => BigInt(t.supply || "0"))

      const { hash, receipt } = await createEvent(
        formData.eventName, ipfsHash, formData.location, formData.description,
        eventTime, tierPrices, tierMaxSupplies, true, true, eventTime, BigInt(10),
      )
      setTxHash(hash)
      setStatusMessage("Syncing event to database...")

      try {
        let createdEventId = ""
        if (receipt) {
          try {
            const logs = parseEventLogs({ abi: VEILTIX_ABI as any, logs: receipt.logs })
            const createdLog = logs.find((l: any) => l.eventName === "EventCreated")
            if (createdLog) {
              createdEventId = (createdLog as any).args.eventId.toString()
            }
          } catch (e) {
            console.warn("Could not parse EventCreated log", e)
          }
        }

        if (!createdEventId) {
          const nextId = await publicClient?.readContract({
            address: CONTRACT_ADDRESS, abi: VEILTIX_ABI, functionName: 'nextEventId',
          }) as bigint
          createdEventId = (nextId - BigInt(1)).toString()
        }

        const totalTickets = tiers.reduce((acc, t) => acc + Number(t.supply || 0), 0)
        const lowestPrice = tierPrices.reduce((min, p) => p < min ? p : min, tierPrices[0])

        await fetch('/api/events/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            eventId: createdEventId,
            name: formData.eventName,
            image: ipfsHash,
            location: formData.location,
            description: formData.description,
            time: Math.floor(dateTime),
            totalTickets: totalTickets.toString(),
            price: lowestPrice.toString(),
            tiers: tiers.map((t, i) => ({
              name: t.name,
              price: parseEther(t.price || "0").toString(),
              supply: Number(t.supply),
              contractTierIndex: i,
            })),
          }),
        })
      } catch (syncErr) {
        console.error("DB sync error (non-fatal):", syncErr)
      }

      setStatusMessage("Event created successfully!")
      setTimeout(() => router.push("/events"), 2000)
    } catch (error: any) {
      console.error(error)
      alert(`Error: ${error.message || "Failed to create event"}`)
      setIsSubmitting(false)
      setStatusMessage("")
    }
  }

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition shadow-sm"
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2"

  const lowestTierPrice = tiers.reduce((min, t) => {
    const p = parseFloat(t.price || "0")
    return p < min ? p : min
  }, Infinity)

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBg variant="create" />
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-4xl mx-auto px-6 py-10">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight"
          >
            Create Event
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-500 text-lg">
            Launch your blockchain-powered event with NFT tickets.
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">

        {/* ── Left: Form ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
          {txHash ? (
            <div className="flex flex-col items-center text-center py-20 px-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="text-green-500" size={40} />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Event Created!</h2>
              <p className="text-gray-500 mb-3">Your event has been deployed on the blockchain.</p>
              <code className="text-orange-500 text-xs font-mono break-all bg-orange-50 px-4 py-2 rounded-lg mb-6 max-w-md">
                TX: {txHash}
              </code>
              <p className="text-gray-400 text-sm">Redirecting to events page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
              {/* Image Upload */}
              <div>
                <label className={labelClass}>Event Cover Image *</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors cursor-pointer group bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required={!uploadedImage}
                  />
                  {uploadedImage ? (
                    <div className="space-y-3">
                      <img src={uploadedImage} alt="Preview" className="w-[300px] h-[180px] mx-auto object-cover rounded-xl shadow-sm" />
                      <p className="text-orange-500 text-sm font-medium">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-14 h-14 bg-gray-200 group-hover:bg-orange-100 rounded-xl flex items-center justify-center mx-auto transition-colors">
                        <Upload size={24} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold">Click to upload or drag and drop</p>
                        <p className="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="eventName" className={labelClass}>Event Name *</label>
                  <input
                    type="text" id="eventName" name="eventName"
                    value={formData.eventName} onChange={handleInputChange}
                    placeholder="e.g., Web3 Conference 2025"
                    className={inputClass} required
                  />
                </div>
                <div>
                  <label htmlFor="location" className={labelClass}>Location *</label>
                  <div className="flex gap-2">
                    <input
                      type="text" id="location" name="location"
                      value={formData.location} onChange={handleInputChange}
                      placeholder="e.g., Ho Chi Minh City, Vietnam"
                      className={`${inputClass} flex-1`} required
                    />
                    <div className="px-4 py-3 bg-orange-100 text-orange-600 rounded-xl font-semibold border border-orange-200 flex-shrink-0 flex items-center justify-center">
                      <MapPin size={20} />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 mt-1 mb-3">
                  <MapLocationPicker onLocationSelect={handleLocationSelect} searchQuery={formData.location} />
                  <p className="text-xs text-gray-400 mt-2 text-center">Bấm vào vị trí trên bản đồ để tự động điền địa chỉ, hoặc gõ địa chỉ để bản đồ tự tìm đến</p>
                </div>
                <div>
                  <label htmlFor="eventDate" className={labelClass}>Event Date *</label>
                  <input
                    type="date" id="eventDate" name="eventDate"
                    value={formData.eventDate} onChange={handleInputChange}
                    className={inputClass} required
                  />
                </div>
                <div>
                  <label htmlFor="eventTime" className={labelClass}>Event Time *</label>
                  <input
                    type="time" id="eventTime" name="eventTime"
                    value={formData.eventTime} onChange={handleInputChange}
                    className={inputClass} required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className={labelClass}>Event Description *</label>
                <textarea
                  id="description" name="description"
                  value={formData.description} onChange={handleInputChange}
                  placeholder="Describe your event, what to expect, and why attendees should join..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>

              {/* ── Ticket Tiers ─────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 font-bold flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-100 text-orange-500 rounded-md flex items-center justify-center text-xs font-bold">T</span>
                    Ticket Tiers
                  </h3>
                  <button
                    type="button"
                    onClick={addTier}
                    disabled={tiers.length >= 8}
                    className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 border border-orange-300 rounded-lg px-3 py-1.5 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <Plus size={15} /> Add Tier
                  </button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {tiers.map((tier, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border border-gray-200 rounded-xl p-4 bg-gray-50 group"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-sm font-semibold text-gray-600">Ticket Tier {index + 1}</p>
                          {tiers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTier(index)}
                              className="ml-auto text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                              <Tag size={11} /> Tier Name *
                            </label>
                            <input
                              type="text"
                              value={tier.name}
                              onChange={e => handleTierChange(index, "name", e.target.value)}
                              placeholder="e.g. VIP, Standard"
                              className={inputClass}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                              <DollarSign size={11} /> Price (ROSE) *
                            </label>
                            <input
                              type="number"
                              value={tier.price}
                              onChange={e => handleTierChange(index, "price", e.target.value)}
                              placeholder="e.g. 0.05"
                              step="0.0001"
                              min="0"
                              className={inputClass}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                              <Users size={11} /> Total Supply *
                            </label>
                            <input
                              type="number"
                              value={tier.supply}
                              onChange={e => handleTierChange(index, "supply", e.target.value)}
                              placeholder="e.g. 500"
                              min="1"
                              className={inputClass}
                              required
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Tiers summary */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400 px-1">
                  <span>
                    Total tickets: <strong className="text-gray-700">{tiers.reduce((s, t) => s + Number(t.supply || 0), 0).toLocaleString()}</strong>
                  </span>
                  <span>
                    From: <strong className="text-orange-500">
                      {isFinite(lowestTierPrice) && lowestTierPrice > 0 ? `${lowestTierPrice} ROSE` : "—"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-orange-500 text-white font-bold text-base rounded-xl hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-orange-500/20 flex flex-col items-center gap-1"
              >
                <span className="flex items-center gap-2">
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin" size={20} />Processing...</>
                  ) : (
                    <>Mint Event &amp; Launch Tickets <ArrowRight size={20} /></>
                  )}
                </span>
                {statusMessage && (
                  <span className="text-sm text-orange-100 font-normal">{statusMessage}</span>
                )}
              </button>

              <p className="text-gray-400 text-xs text-center">
                * Required fields. Your event will be deployed as an NFT on the Oasis Sapphire blockchain.
              </p>
            </form>
          )}
        </motion.div>

        {/* ── Right: Live 3D Ticket Preview ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="hidden lg:block sticky top-28"
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 text-center">Live Preview</p>

            {/* 3D Ticket Preview */}
            <TiltCard intensity={18} className="mx-auto" style={{ width: 280 }}>
              <div className="rounded-2xl overflow-hidden relative"
                style={{
                  width: 280, height: 163,
                  background: uploadedImage
                    ? "none"
                    : "linear-gradient(135deg, #fb923c 0%, #ea580c 55%, #b45309 100%)",
                  boxShadow: "0 20px 60px -12px rgba(249,115,22,0.5), 0 8px 20px -8px rgba(0,0,0,0.2)",
                }}
              >
                {uploadedImage && (
                  <>
                    <img src={uploadedImage} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.7) 0%, rgba(180,83,9,0.85) 100%)" }} />
                  </>
                )}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-50 z-10" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-50 z-10" />
                <div className="absolute inset-x-5 top-1/2 border-t border-dashed border-white/30 z-10" />
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "8px 8px" }} />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none z-10" />

                <div className="absolute inset-0 p-4 flex flex-col justify-between z-20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-orange-200 text-[9px] font-bold uppercase tracking-[0.15em]">VeilTix</p>
                      <p className="text-white font-bold text-sm leading-tight mt-0.5">
                        {formData.eventName || "Event Name"}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                      <Ticket size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      {formData.eventDate && (
                        <p className="text-white/80 text-[9px] flex items-center gap-1">
                          <Calendar size={8} /> {formData.eventDate}
                        </p>
                      )}
                      {formData.location && (
                        <p className="text-white/80 text-[9px] flex items-center gap-1">
                          <MapPin size={8} /> {formData.location}
                        </p>
                      )}
                      {tiers[0]?.price && (
                        <p className="text-white font-bold text-xs">From {tiers[0].price} ROSE</p>
                      )}
                    </div>
                    <div className="w-9 h-9 bg-white/20 rounded-lg grid grid-cols-5 gap-[1.5px] p-1 border border-white/20">
                      {[1,1,0,1,0,1,0,1,1,1,1,0,0,1,0,0,1,0,1,0,1,1,0,1,1].map((on, i) => (
                        <div key={i} className={`rounded-[1px] ${on ? "bg-white/90" : ""}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Tier badges */}
            {tiers.some(t => t.name) && (
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                {tiers.filter(t => t.name).map((t, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full border border-orange-200">
                    {t.name}{t.price ? ` · ${t.price} ROSE` : ""}
                  </span>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="mt-5 space-y-2.5">
              {[
                { title: "Immutable Records", desc: "NFT tickets on blockchain" },
                { title: "Secondary Market", desc: "Built-in royalties 5%" },
                { title: "Instant Minting", desc: "Live in minutes" },
              ].map((item, i) => (
                <motion.div key={item.title}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{item.title}</p>
                    <p className="text-[10px] text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        </div>{/* end grid */}
      </div>
    </div>
  )
}
