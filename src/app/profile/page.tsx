"use client"

import { useState, useEffect, useRef } from "react"
import { Mail, MapPin, Copy, Check, Ticket, TrendingUp, Calendar, ExternalLink, Edit2, Save, Camera, X } from "lucide-react"
import Link from "next/link"
import { useWallet } from "@/components/context/walletContext"
import { IUserSession } from "@/interfaces/walletContextType"

export default function ProfilePage() {
  const { user: rawUser, address, refreshUser, isConnected } = useWallet()
  const user = rawUser as IUserSession | null;
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState("")
  const [avatar, setAvatar] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setUsername(user.username || user.email.split('@')[0])
      setAvatar(user.avatar_url || "")
    }
  }, [user])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.User_ID,
          username: username,
          avatar_url: avatar
        })
      })

      if (res.ok) {
        await refreshUser()
        setIsEditing(false)
      }
    } catch (err) {
      console.error("Failed to save profile:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const userData = {
    username: username || (user?.email?.split('@')[0]) || "Crypto Fan",
    email: user?.email || "user@example.com",
    location: "Vietnam",
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString() : "January 2024",
    totalTickets: 12, // Still mock for now, can be calculated later
    totalSpent: "$2,450",
    eventsAttended: 8,
  }

  const myTickets = [
    {
      id: 1,
      eventName: "Web3 Conference 2024",
      date: "March 15, 2024",
      location: "Ho Chi Minh City",
      price: "$150",
      status: "Active",
      tokenId: "0x123...abc",
      image: "/placeholder.svg?width=200&height=200",
    },
    {
      id: 2,
      eventName: "NFT Art Summit",
      date: "March 20, 2024",
      location: "Bangkok, Thailand",
      price: "$120",
      status: "Active",
      tokenId: "0x456...def",
      image: "/placeholder.svg?width=200&height=200",
    },
    {
      id: 3,
      eventName: "DeFi Workshop",
      date: "February 28, 2024",
      location: "Online",
      price: "$50",
      status: "Attended",
      tokenId: "0x789...ghi",
      image: "/placeholder.svg?width=200&height=200",
    },
    {
      id: 4,
      eventName: "Crypto Networking Event",
      date: "February 10, 2024",
      location: "Ho Chi Minh City",
      price: "$75",
      status: "Attended",
      tokenId: "0xabc...jkl",
      image: "/placeholder.svg?width=200&height=200",
    },
  ]

  const transactionHistory = [
    {
      id: 1,
      type: "Purchase",
      event: "Web3 Conference 2024",
      amount: "$150",
      date: "March 10, 2024",
      hash: "0x1234...5678",
    },
    {
      id: 2,
      type: "Transfer",
      event: "NFT Art Summit",
      amount: "1 Ticket",
      date: "March 5, 2024",
      hash: "0x9876...5432",
    },
    {
      id: 3,
      type: "Purchase",
      event: "DeFi Workshop",
      amount: "$50",
      date: "February 25, 2024",
      hash: "0xabcd...efgh",
    },
    {
      id: 4,
      type: "Purchase",
      event: "Crypto Networking Event",
      amount: "$75",
      date: "February 5, 2024",
      hash: "0x5678...1234",
    },
  ]

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-orange-500/20 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
            {/* Avatar */}
            <div className="relative group">
               <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-2 border-orange-500/20 shadow-2xl shadow-orange-500/10">
                 {avatar ? (
                   <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   userData.username.charAt(0).toUpperCase()
                 )}
               </div>
               {isEditing && (
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-300"
                 >
                   <Camera size={24} />
                 </button>
               )}
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileChange} 
                 className="hidden" 
                 accept="image/*" 
               />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                {isEditing ? (
                  <input 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/5 border border-orange-500/30 rounded-lg px-4 py-2 text-3xl font-bold text-white outline-none focus:border-orange-500 transition w-full max-w-md"
                    placeholder="Enter username..."
                  />
                ) : (
                  <h1 className="text-4xl font-bold text-white">{userData.username}</h1>
                )}
                
                <button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={isSaving}
                  className={`p-2 rounded-full transition ${isEditing ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"}`}
                >
                  {isSaving ? "..." : isEditing ? <Save size={20} /> : <Edit2 size={20} />}
                </button>
                {isEditing && (
                   <button 
                    onClick={() => {
                      setIsEditing(false)
                      setUsername(user?.username || user?.email.split('@')[0] || "")
                      setAvatar(user?.avatar_url || "")
                    }}
                    className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                   >
                     <X size={20} />
                   </button>
                )}
              </div>
              
              <div className="space-y-2 text-white/70">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-orange-400/50" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-orange-400/50" />
                  <span>{userData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-orange-400/50" />
                  <span>Joined {userData.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="bg-black/50 backdrop-blur-md border border-orange-500/30 rounded-2xl p-6 w-full md:w-80 shadow-xl">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Connected Wallet</p>
              <div className="flex items-center justify-between gap-2 mb-4">
                <code className="text-orange-400 font-mono text-sm break-all">{address || "0x..."}</code>
                <button
                  onClick={copyAddress}
                  className="p-2 hover:bg-orange-500/10 rounded-xl transition"
                  title="Copy address"
                >
                  {copied ? (
                    <Check size={18} className="text-green-400" />
                  ) : (
                    <Copy size={18} className="text-orange-400" />
                  )}
                </button>
              </div>
              <a
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition text-xs font-bold"
              >
                View on Etherscan
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 border border-orange-500/20 rounded-lg p-4">
              <p className="text-white/60 text-sm mb-2">Total Tickets</p>
              <p className="text-2xl font-bold text-orange-400">{userData.totalTickets}</p>
            </div>
            <div className="bg-black/30 border border-orange-500/20 rounded-lg p-4">
              <p className="text-white/60 text-sm mb-2">Total Spent</p>
              <p className="text-2xl font-bold text-orange-400">{userData.totalSpent}</p>
            </div>
            <div className="bg-black/30 border border-orange-500/20 rounded-lg p-4">
              <p className="text-white/60 text-sm mb-2">Events Attended</p>
              <p className="text-2xl font-bold text-orange-400">{userData.eventsAttended}</p>
            </div>
            <div className="bg-black/30 border border-orange-500/20 rounded-lg p-4">
              <p className="text-white/60 text-sm mb-2">Loyalty Tier</p>
              <p className="text-2xl font-bold text-orange-400">Gold</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-black border-b border-orange-500/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-4 font-semibold transition border-b-2 whitespace-nowrap ${
                activeTab === "overview"
                  ? "text-orange-400 border-orange-400"
                  : "text-white/60 border-transparent hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-4 py-4 font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "tickets"
                  ? "text-orange-400 border-orange-400"
                  : "text-white/60 border-transparent hover:text-white"
              }`}
            >
              <Ticket size={18} />
              My Tickets ({userData.totalTickets})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-4 font-semibold transition border-b-2 whitespace-nowrap ${
                activeTab === "history"
                  ? "text-orange-400 border-orange-400"
                  : "text-white/60 border-transparent hover:text-white"
              }`}
            >
              Transaction History
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Recent Tickets</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {myTickets.slice(0, 2).map((ticket) => (
                  <div key={ticket.id} className="bg-black/50 border border-orange-500/20 rounded-lg overflow-hidden hover:border-orange-500/50 transition">
                    <div className="h-32 bg-gradient-to-r from-orange-500/10 to-orange-600/10 relative">
                      <img src={ticket.image} alt={ticket.eventName} className="w-full h-full object-cover opacity-50" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white mb-2">{ticket.eventName}</h3>
                      <div className="space-y-1 text-sm text-white/60 mb-4">
                        <p>📅 {ticket.date}</p>
                        <p>📍 {ticket.location}</p>
                        <p>💰 {ticket.price}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          ticket.status === "Active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-orange-500/20 text-orange-400"
                        }`}>
                          {ticket.status}
                        </span>
                        <code className="text-orange-400/70 text-xs">{ticket.tokenId}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Quick Stats</h2>
              <div className="bg-black/50 border border-orange-500/20 rounded-lg p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <Ticket size={24} />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Average Ticket Price</p>
                      <p className="text-2xl font-bold text-white">$204</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Events This Month</p>
                      <p className="text-2xl font-bold text-white">3</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Portfolio Value</p>
                      <p className="text-2xl font-bold text-white">$2.5K</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === "tickets" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">All My Tickets</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {myTickets.map((ticket) => (
                <div key={ticket.id} className="bg-black/50 border border-orange-500/20 rounded-lg overflow-hidden hover:border-orange-500/50 transition">
                  <div className="h-40 bg-gradient-to-r from-orange-500/10 to-orange-600/10 relative">
                    <img src={ticket.image} alt={ticket.eventName} className="w-full h-full object-cover opacity-50" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-white text-lg mb-3">{ticket.eventName}</h3>
                    <div className="space-y-2 text-sm text-white/60 mb-4">
                      <p className="flex items-center gap-2">
                        <Calendar size={16} className="text-orange-400" />
                        {ticket.date}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin size={16} className="text-orange-400" />
                        {ticket.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>💰</span>
                        {ticket.price}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-orange-500/10">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === "Active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {ticket.status}
                      </span>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition text-sm font-semibold">
                          View
                        </button>
                        <button className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition text-sm font-semibold">
                          Transfer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
            <div className="space-y-3">
              {transactionHistory.map((transaction) => (
                <div key={transaction.id} className="bg-black/50 border border-orange-500/20 rounded-lg p-6 hover:border-orange-500/50 transition">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold whitespace-nowrap">
                          {transaction.type}
                        </span>
                        <h3 className="font-bold text-white truncate">{transaction.event}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{transaction.date}</span>
                        <code className="text-orange-400/70 font-mono">{transaction.hash}</code>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white text-lg">{transaction.amount}</p>
                      <a
                        href={`https://etherscan.io/tx/${transaction.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-400 hover:text-orange-300 transition text-sm inline-flex items-center gap-1"
                      >
                        View <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
