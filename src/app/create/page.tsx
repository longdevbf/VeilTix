"use client"

import { useState, useEffect } from "react"
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi"
import { VEILTIX_ABI, VEILTIX_ADDRESS } from "@/components/config/abi"
import { parseEther } from "viem"
import { Calendar, MapPin, AlignLeft, Image as ImageIcon, Plus, Trash2, Info, Loader2, AlertCircle, Lock, Users, Clock, Shield } from "lucide-react"
import { useWallet } from "@/components/context/walletContext"
import Link from "next/link"
import dynamic from "next/dynamic"

const LocationSelector = dynamic(() => import("@/components/event/LocationSelector"), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-white/5 animate-pulse rounded-2xl" />
});

export default function CreatePage() {
  const { user, isConnected, isLoading: isAuthLoading } = useWallet()

  // 1. Basic Info
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [image, setImage] = useState<string | null>(null)

  // Location Verification Specs
  const [isOnline, setIsOnline] = useState(false)
  const [lat, setLat] = useState<number | undefined>()
  const [lng, setLng] = useState<number | undefined>()
  const [isVerified, setIsVerified] = useState(false)

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = height * (MAX_WIDTH / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Giảm chất lượng xuống 0.7 để tối ưu dung lượng (JPEG)
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const optimizedImage = await resizeImage(file);
        setImage(optimizedImage);
      } catch (err) {
        console.error("Image resize error:", err);
        // Fallback to original if resize fails
        const reader = new FileReader();
        reader.onload = (ev) => setImage(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  }

  // 2. Ticket Tiers
  const [tiers, setTiers] = useState([{ tier: "Standard", price: "0.01", max_supply: 100 }])

  // 3. Contract Rules
  const [transferable, setTransferable] = useState(true)
  const [refundable, setRefundable] = useState(false)
  const [refundDeadline, setRefundDeadline] = useState("0")
  const [maxPerUser, setMaxPerUser] = useState(5)

  const [isMinting, setIsMinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Contract Write
  const { data: hash, writeContract, error: contractError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Sync with DB after blockchain success
  useEffect(() => {
    if (isConfirmed && user) {
      syncToDatabase()
    }
  }, [isConfirmed])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    )
  }

  if (!isConnected || !user || user.role !== 'organizer') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-xl">
           <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
              <Lock size={40} />
           </div>
           <h1 className="text-3xl font-bold text-white mb-4">Access Restricted</h1>
           <p className="text-white/60 mb-8 leading-relaxed">
              Only registered **Organizers** can create and manage event NFT collections. If you are an organizer, please log in with your authorized wallet.
           </p>
           {!isConnected ? (
              <p className="text-orange-400 font-bold mb-4">Please connect your wallet first</p>
           ) : (
              <Link href="/" className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-orange-500/20">
                 Return to Home
              </Link>
           )}
        </div>
      </div>
    )
  }

  const addTier = () => setTiers([...tiers, { tier: "", price: "0.01", max_supply: 100 }])
  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index))
    }
  }
  const updateTier = (index: number, field: string, value: string | number) => {
    const newTiers = [...tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setTiers(newTiers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!isOnline && !isVerified) {
      setError("Please search and confirm the event location on the map.")
      return
    }

    setIsMinting(true)
    setError(null)

    try {
      const totalTickets = tiers.reduce((acc, t) => acc + t.max_supply, 0)
      const minPrice = tiers.reduce((min, t) => (parseFloat(t.price) < min ? parseFloat(t.price) : min), parseFloat(tiers[0].price))
      
      const startTimeUnix = Math.floor(new Date(startTime).getTime() / 1000)
      
      writeContract({
        address: VEILTIX_ADDRESS as `0x${string}`,
        abi: VEILTIX_ABI,
        functionName: "createEvent",
        args: [
          title,
          BigInt(startTimeUnix),
          BigInt(totalTickets),
          parseEther(minPrice.toString()),
          transferable,
          refundable,
          BigInt(refundDeadline),
          BigInt(maxPerUser)
        ],
      })
    } catch (err: any) {
      setError(err?.message || "Failed to initiate transaction")
      setIsMinting(false)
    }
  }

  const syncToDatabase = async () => {
    try {
      const payload = {
        Wallet_ID: user.Wallet_ID,
        title,
        description,
        location,
        start_time: startTime,
        end_time: endTime,
        contract_address: VEILTIX_ADDRESS,
        status: "active",
        event_image: image,
        is_online: isOnline,
        latitude: lat,
        longitude: lng,
        tiers: tiers.map(t => ({
          tier: t.tier,
          price: parseFloat(t.price),
          max_supply: t.max_supply
        }))
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSuccess(true)
        setIsMinting(false)
      } else {
        setError("Success on blockchain but error saving to DB: Failed to save event to database")
      }
    } catch (err) {
      setError("Database sync failed")
    } finally {
      setIsMinting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/40">
           <Plus size={48} className="text-white rotate-45" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">Event Launched!</h1>
        <p className="text-xl text-white/60 mb-10 max-w-lg">
          Your event NFTs have been minted on Oasis Sapphire and metadata is synchronized.
        </p>
        <Link href="/events" className="px-10 py-4 bg-white text-black rounded-2xl font-bold hover:bg-orange-500 hover:text-white transition-all">
          View Your Events
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              Create New Event
            </h1>
            <p className="text-orange-500 font-bold tracking-widest uppercase text-sm">Launch your NFT collection</p>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Info size={16} />
            <span>Deployment gas is optimized for Sapphire Testnet</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-xs text-black font-bold">01</span>
                General Information
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/50 ml-1 uppercase">Event Title</label>
                  <div className="relative">
                    <AlignLeft size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500/50" />
                    <input 
                      required value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="E.g. Oasis Sapphire Summit 2024"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 transition"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/50 ml-1 uppercase text-xs">Start Date & Time</label>
                    <input 
                      type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-orange-500/50 transition text-white/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/50 ml-1 uppercase text-xs">End Date & Time</label>
                    <input 
                      type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-orange-500/50 transition text-white/80"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-white/50 ml-1 uppercase">Event Type & Location</label>
                  
                  <div className="flex p-1 bg-black/40 border border-white/10 rounded-2xl w-fit mb-4">
                    <button
                      type="button"
                      onClick={() => { setIsOnline(false); setIsVerified(false); }}
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!isOnline ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      Offline / Venue
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsOnline(true); setIsVerified(true); setLocation(""); }}
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${isOnline ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      Online / Virtual
                    </button>
                  </div>

                  {isOnline ? (
                    <div className="relative animate-in fade-in slide-in-from-left-4">
                      <Shield size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/50" />
                      <input 
                        required value={location} onChange={e => setLocation(e.target.value)}
                        placeholder="Link to Zoom, Google Meet, or Virtual World"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 transition"
                      />
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-right-4">
                      <LocationSelector 
                        onVerify={(addr, latitude, longitude) => {
                          setLocation(addr);
                          setLat(latitude);
                          setLng(longitude);
                          setIsVerified(true);
                        }}
                        initialAddress={location}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/50 ml-1 uppercase">Description</label>
                  <textarea 
                    required value={description} onChange={e => setDescription(e.target.value)}
                    rows={4} placeholder="Describe your amazing event..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-orange-500/50 transition resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-xs text-black font-bold">02</span>
                  Ticket Categories
                </h2>
                <button 
                  type="button" onClick={addTier}
                  className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-400"
                >
                  <Plus size={16} /> Add Category
                </button>
              </div>

              <div className="space-y-4">
                {tiers.map((t, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 relative group">
                    <div className="md:col-span-5 space-y-2">
                      <input 
                        placeholder="Tier Name (e.g. VIP)" value={t.tier}
                        onChange={e => updateTier(i, 'tier', e.target.value)}
                        className="w-full bg-transparent border-none outline-none font-bold"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-xs font-bold text-white/30">ETH</span>
                        <input 
                          type="number" step="0.001" value={t.price}
                          onChange={e => updateTier(i, 'price', e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-sm font-bold"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-xs font-bold text-white/30">QTY</span>
                        <input 
                          type="number" value={t.max_supply}
                          onChange={e => updateTier(i, 'max_supply', parseInt(e.target.value))}
                          className="w-full bg-transparent border-none outline-none text-sm font-bold"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center">
                      {tiers.length > 1 && (
                        <button type="button" onClick={() => removeTier(i)} className="text-white/20 hover:text-red-500 transition">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-xs text-black font-bold">03</span>
                Contract Rules
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                   <span className="font-bold text-sm">Transferable?</span>
                   <button 
                    type="button" onClick={() => setTransferable(!transferable)}
                    className={`w-12 h-6 rounded-full transition-all relative ${transferable ? 'bg-orange-500' : 'bg-white/10'}`}
                   >
                     <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${transferable ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                   <span className="font-bold text-sm">Refundable?</span>
                   <button 
                    type="button" onClick={() => setRefundable(!refundable)}
                    className={`w-12 h-6 rounded-full transition-all relative ${refundable ? 'bg-orange-500' : 'bg-white/10'}`}
                   >
                     <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${refundable ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Max Per User</label>
                  <input 
                    type="number" value={maxPerUser} onChange={e => setMaxPerUser(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-orange-500/50 transition font-bold"
                  />
                </div>
              </div>
            </section>

            <section className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-8">
               <h3 className="font-bold mb-4 flex items-center gap-2 text-orange-500">
                  <ImageIcon size={18} /> Event Presentation
               </h3>
               <div 
                  className="aspect-video bg-black/40 rounded-2xl border-2 border-dashed border-orange-500/30 flex flex-col items-center justify-center mb-0 overflow-hidden relative group hover:border-orange-500/60 transition-all cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
               >
                  {image ? (
                    <>
                      <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <p className="text-white font-bold text-sm bg-orange-500 px-4 py-2 rounded-xl">Change Image</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-3">
                      <Plus size={32} className="mx-auto text-orange-500/40 group-hover:text-orange-500 transition-colors" />
                      <div>
                        <p className="text-sm font-bold text-white/60">Upload Cover Image</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">JPG, PNG or WEBP</p>
                      </div>
                    </div>
                  )}
                  <input 
                    id="file-upload"
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
               </div>
            </section>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-red-500">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isMinting || isConfirming || (!isOnline && !isVerified)}
              className="w-full py-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:grayscale text-white rounded-3xl font-extrabold text-lg transition-all shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-3"
            >
               {(isMinting || isConfirming) ? (
                 <>
                   <Loader2 className="animate-spin" />
                   {isConfirming ? "Confirming..." : "Minting NFT..."}
                 </>
               ) : (
                 <>
                   MINT EVENT NFT & LAUNCH
                 </>
               )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
