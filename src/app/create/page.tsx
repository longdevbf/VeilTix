"use client"

import { useState } from "react"
import { Upload, Calendar, Users, DollarSign, ArrowRight } from "lucide-react"

export default function CreatePage() {
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    eventTime: "",
    location: "",
    description: "",
    totalSupply: "",
    ticketPrice: "",
    image: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
    setIsSubmitting(true)
    
    // Simulate minting process
    setTimeout(() => {
      alert(`NFT Event "${formData.eventName}" minted successfully!\nToken ID: 0x${Math.random().toString(16).slice(2)}`)
      setFormData({
        eventName: "",
        eventDate: "",
        eventTime: "",
        location: "",
        description: "",
        totalSupply: "",
        ticketPrice: "",
        image: null,
      })
      setUploadedImage(null)
      setIsSubmitting(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black pt-20">
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Create Event & Mint NFT Tickets
          </h1>
          <p className="text-xl text-white/70 mb-12">
            Launch your blockchain-powered event with NFT tickets. Full control, complete transparency.
          </p>

          <div className="bg-orange-500/5 border border-orange-500/30 rounded-2xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Event Image Upload */}
              <div>
                <label className="block text-white font-semibold mb-4">Event Cover Image</label>
                <div className="relative border-2 border-dashed border-orange-500/30 rounded-lg p-8 text-center hover:border-orange-500/50 transition cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img src={uploadedImage} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <p className="text-orange-400 text-sm">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload size={32} className="mx-auto text-orange-400/70 group-hover:text-orange-400 transition" />
                      <div>
                        <p className="text-white font-semibold">Click to upload or drag and drop</p>
                        <p className="text-white/60 text-sm">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="eventName" className="block text-white font-semibold mb-2">Event Name *</label>
                  <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    placeholder="e.g., Web3 Conference 2024"
                    className="w-full px-4 py-3 bg-black/50 border border-orange-500/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-white font-semibold mb-2">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Ho Chi Minh City, Vietnam"
                    className="w-full px-4 py-3 bg-black/50 border border-orange-500/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="eventDate" className="block text-white font-semibold mb-2">Event Date *</label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/50 border border-orange-500/20 rounded-lg text-white focus:outline-none focus:border-orange-500/50 transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="eventTime" className="block text-white font-semibold mb-2">Event Time *</label>
                  <input
                    type="time"
                    id="eventTime"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/50 border border-orange-500/20 rounded-lg text-white focus:outline-none focus:border-orange-500/50 transition"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-white font-semibold mb-2">Event Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your event, what to expect, and why attendees should join..."
                  rows={4}
                  className="w-full px-4 py-3 bg-black/50 border border-orange-500/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 transition resize-none"
                  required
                />
              </div>

              {/* Ticket Configuration Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="totalSupply" className="flex items-center gap-2 text-white font-semibold mb-2">
                    <Users size={18} className="text-orange-400" />
                    Total Ticket Supply *
                  </label>
                  <input
                    type="number"
                    id="totalSupply"
                    name="totalSupply"
                    value={formData.totalSupply}
                    onChange={handleInputChange}
                    placeholder="e.g., 500"
                    className="w-full px-4 py-3 bg-black/50 border border-orange-500/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="ticketPrice" className="flex items-center gap-2 text-white font-semibold mb-2">
                    <DollarSign size={18} className="text-orange-400" />
                    Ticket Price (USD) *
                  </label>
                  <input
                    type="number"
                    id="ticketPrice"
                    name="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    step="0.01"
                    className="w-full px-4 py-3 bg-black/50 border border-orange-500/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 transition"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg hover:from-orange-500 hover:to-orange-700 disabled:from-orange-400/50 disabled:to-orange-600/50 transition font-semibold text-lg inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Minting NFT..." : "Mint Event & Launch Tickets"}
                {!isSubmitting && <ArrowRight size={20} />}
              </button>

              <p className="text-white/60 text-sm text-center">
                * Required fields. Your event will be deployed as an NFT on the blockchain.
              </p>
            </form>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                title: "Immutable Records",
                description: "NFT tickets are permanently recorded on the blockchain",
              },
              {
                title: "Secondary Market",
                description: "Enable ticket resale with built-in royalties and control",
              },
              {
                title: "Instant Minting",
                description: "Deploy your event and start selling in minutes",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 border border-orange-500/30 rounded-lg bg-orange-500/5"
              >
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
