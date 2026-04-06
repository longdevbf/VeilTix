"use client"

import { useState, useEffect } from "react"
import { Upload, Calendar, Users, DollarSign, ArrowRight, Plus, Trash2, Shield, Info, Clock } from "lucide-react"
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi"
import { parseEther } from "viem"
import { VEILTIX_ABI, VEILTIX_ADDRESS } from "@/components/config/abi"
import { useRouter } from "next/navigation"

interface TicketTier {
  tier: string;
  price: string;
  max_supply: string;
}

export default function CreatePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    eventName: "",
    location: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    transferable: true,
    refundable: false,
    refundDeadline: "",
    maxPerUser: "5",
    image: null as File | null,
  })

  const [tiers, setTiers] = useState<TicketTier[]>([
    { tier: "Standard", price: "0.01", max_supply: "100" }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  // Wagmi hooks
  const { data: hash, writeContract, isPending: isMinting, error: mintError } = useWriteContract();
  const { isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleTierChange = (index: number, field: keyof TicketTier, value: string) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  }

  const addTier = () => {
    setTiers([...tiers, { tier: "", price: "0.01", max_supply: "100" }]);
  }

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index));
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsSubmitting(true)

    try {
      // 1. Prepare data for Blockchain
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).getTime() / 1000;
      const totalTickets = tiers.reduce((acc, tier) => acc + Number(tier.max_supply), 0);
      const basePrice = parseEther(tiers[0].price); // Using first tier as base price for contract
      const refundDeadlineTs = formData.refundDeadline ? new Date(formData.refundDeadline).getTime() / 1000 : 0;

      // 2. Call Smart Contract
      writeContract({
        address: VEILTIX_ADDRESS,
        abi: VEILTIX_ABI,
        functionName: "createEvent",
        args: [
          formData.eventName,
          BigInt(startDateTime),
          BigInt(totalTickets),
          basePrice,
          formData.transferable,
          formData.refundable,
          BigInt(refundDeadlineTs),
          BigInt(formData.maxPerUser)
        ],
      });
    } catch (err) {
      console.error("Submission error:", err);
      setIsSubmitting(false);
    }
  }

  // Handle post-minting: Save to Backend
  useEffect(() => {
    if (isTxSuccess && hash) {
      const saveToBackend = async () => {
        try {
          // Prepare times
          const start_time = `${formData.startDate}T${formData.startTime}:00`;
          const end_time = formData.endDate && formData.endTime ? `${formData.endDate}T${formData.endTime}:00` : start_time;

          const payload = {
            title: formData.eventName,
            description: formData.description,
            location: formData.location,
            start_time,
            end_time,
            contract_address: VEILTIX_ADDRESS, // In real app, might be dynamic or the singleton
            event_image: uploadedImage, // Storing base64 for demo, usually IPFS or upload s3
            Wallet_ID: 1, // Placeholder for user ID or address, should match DB schema
            tiers: tiers.map(t => ({
              tier: t.tier,
              price: parseFloat(t.price),
              max_supply: parseInt(t.max_supply)
            }))
          };

          const res = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            alert("Event created successfully On-chain and Off-chain!");
            router.push("/events");
          } else {
            throw new Error("Failed to save event to database");
          }
        } catch (err: any) {
          alert("Success on blockchain but error saving to DB: " + err.message);
        } finally {
          setIsSubmitting(false);
        }
      };

      saveToBackend();
    }
  }, [isTxSuccess, hash]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black pt-20">
      <section className="relative py-20 px-6 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
             <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400">
                <Plus size={32} />
             </div>
             <div>
                <h1 className="text-4xl md:text-5xl font-bold">Launch Your Event</h1>
                <p className="text-white/60">Fill details for blockchain minting and database listing</p>
             </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8 bg-white/5 border border-white/10 p-8 rounded-2xl">
                {/* Section: Basic Info */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
                    <Info size={20} className="text-orange-400" /> Basic Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-white/70 mb-2">EVENT TITLE</label>
                       <input 
                        type="text" 
                        name="eventName" 
                        value={formData.eventName} 
                        onChange={handleInputChange}
                        placeholder="Ex: Web3 Founders Night" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500/50 outline-none transition"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-white/70 mb-2">LOCATION</label>
                       <input 
                        type="text" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleInputChange}
                        placeholder="Ex: Ho Chi Minh City, Convention Center" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500/50 outline-none transition"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-white/70 mb-2">DESCRIPTION</label>
                       <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Tell people about your event..." 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500/50 outline-none transition resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Timing */}
                <div className="space-y-6">
                   <h3 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
                    <Clock size={20} className="text-orange-400" /> Date & Time
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-white/70 mb-2 underline decoration-orange-500/30">START DATE</label>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white/70 mb-2 underline decoration-orange-500/30">START TIME</label>
                        <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white/70 mb-2 italic">END DATE</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white/70 mb-2 italic">END TIME</label>
                        <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500" />
                    </div>
                  </div>
                </div>

                {/* Section: Tiers */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Users size={20} className="text-orange-400" /> Ticket Tiers
                      </h3>
                      <button type="button" onClick={addTier} className="text-sm px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition flex items-center gap-1">
                        <Plus size={14} /> Add Tier
                      </button>
                   </div>
                   <div className="space-y-4">
                      {tiers.map((tier, index) => (
                        <div key={index} className="grid md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 border border-white/5 items-end relative group">
                           {index > 0 && (
                            <button type="button" onClick={() => removeTier(index)} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg">
                               <Trash2 size={12} />
                            </button>
                           )}
                           <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-white/40 mb-1">TIER NAME</label>
                              <input type="text" placeholder="Standard" value={tier.tier} onChange={(e) => handleTierChange(index, 'tier', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" required />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-white/40 mb-1">PRICE (ETH)</label>
                              <input type="number" step="0.001" value={tier.price} onChange={(e) => handleTierChange(index, 'price', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" required />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-white/40 mb-1">SUPPLY</label>
                              <input type="number" value={tier.max_supply} onChange={(e) => handleTierChange(index, 'max_supply', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" required />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Section: Contract Rules */}
                <div className="space-y-6">
                   <h3 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
                    <Shield size={20} className="text-orange-400" /> Contract Rules
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <div>
                           <p className="font-bold">Transferable</p>
                           <p className="text-xs text-white/50">Allow users to send tickets to others</p>
                        </div>
                        <input type="checkbox" name="transferable" checked={formData.transferable} onChange={handleInputChange} className="w-6 h-6 accent-orange-500 cursor-pointer" />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <div>
                           <p className="font-bold">Refundable</p>
                           <p className="text-xs text-white/50">Enable on-chain refund requests</p>
                        </div>
                        <input type="checkbox" name="refundable" checked={formData.refundable} onChange={handleInputChange} className="w-6 h-6 accent-orange-500 cursor-pointer" />
                      </div>

                      {formData.refundable && (
                         <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-white/70 mb-2">REFUND DEADLINE</label>
                            <input type="datetime-local" name="refundDeadline" value={formData.refundDeadline} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" required={formData.refundable} />
                         </div>
                      )}

                      <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-white/70 mb-2 flex items-center gap-2">
                             Max Tickets Per User 
                             <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded italic">Anti-Scalper Control</span>
                          </label>
                          <input type="number" name="maxPerUser" value={formData.maxPerUser} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" required />
                      </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-6">
                   {!isConnected ? (
                      <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-xl text-center">
                        <p className="text-orange-400 font-bold mb-4">Please connect your wallet to create event</p>
                      </div>
                   ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || isMinting || isWaitingForTx}
                      className="w-full px-8 py-5 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-2xl hover:from-orange-500 hover:to-orange-700 disabled:opacity-50 transition font-extrabold text-xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                      {isMinting || isWaitingForTx ? (
                        <>
                          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          {isMinting ? "CONFIRMING..." : "MINTING ON CHAIN..."}
                        </>
                      ) : (
                        <>
                          MINT EVENT NFT & LAUNCH
                          <ArrowRight size={24} className="group-hover:translate-x-1 transition" />
                        </>
                      )}
                    </button>
                   )}
                   {mintError && <p className="text-red-400 text-sm mt-4 text-center">Error: {mintError.message}</p>}
                </div>
              </form>
            </div>

            {/* Sidebar Column: Preview / Upload */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <label className="block text-sm font-bold text-white/70 mb-4">EVENT COVER IMAGE</label>
                  <div className="relative border-2 border-dashed border-orange-500/30 rounded-xl p-4 text-center hover:border-orange-500/50 transition cursor-pointer group bg-black/20">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {uploadedImage ? (
                      <div className="space-y-4">
                        <img src={uploadedImage} alt="Preview" className="w-full h-56 object-cover rounded-lg shadow-2xl" />
                        <div className="flex items-center justify-center gap-2 text-orange-400 text-sm font-bold">
                           <Upload size={16} /> Click to change
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 space-y-3">
                        <Upload size={48} className="mx-auto text-orange-400/40 group-hover:text-orange-400 transition" />
                        <div>
                          <p className="text-white font-bold text-lg">Upload Cover</p>
                          <p className="text-white/40 text-xs">High Resolution PNG/JPG</p>
                        </div>
                      </div>
                    )}
                  </div>
               </div>

               <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                     <Shield size={18} className="text-orange-400" /> What happens next?
                  </h4>
                  <ul className="text-sm space-y-3 text-white/60">
                    <li className="flex gap-2">
                       <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                       Your event is minted as a permanent record on Oasis Sapphire.
                    </li>
                    <li className="flex gap-2">
                       <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                       Metadata is secured in the private database.
                    </li>
                    <li className="flex gap-2">
                       <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                       Tickets go live immediately for the public.
                    </li>
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
