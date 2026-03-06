"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Wallet, User, Ticket, Send } from "lucide-react"

export function WalletButton() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    setIsConnected(true)
    setDropdownOpen(false)
  }

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg hover:from-orange-500 hover:to-orange-700 transition font-semibold"
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-lg hover:bg-orange-500/30 transition"
      >
        <Wallet size={18} />
        <span>0x1234...5678</span>
        <ChevronDown size={16} className={`transition ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-black/95 border border-orange-500/30 rounded-lg overflow-hidden shadow-xl z-50">
          <div className="border-b border-orange-500/20 px-4 py-3 text-white/60 text-sm font-semibold">
            Account
          </div>
          
          <Link href="/profile" className="w-full px-4 py-3 flex items-center gap-3 text-white/80 hover:bg-orange-500/10 transition block">
            <User size={18} />
            <span>Profile</span>
          </Link>
          
          <Link href="/profile?tab=tickets" className="w-full px-4 py-3 flex items-center gap-3 text-white/80 hover:bg-orange-500/10 transition block">
            <Ticket size={18} />
            <span>My Tickets</span>
          </Link>
          
          <Link href="/profile?tab=transfer" className="w-full px-4 py-3 flex items-center gap-3 text-white/80 hover:bg-orange-500/10 transition block">
            <Send size={18} />
            <span>Transfer</span>
          </Link>
          
          <div className="border-t border-orange-500/20 px-4 py-3">
            <button
              onClick={() => {
                setIsConnected(false)
                setDropdownOpen(false)
              }}
              className="w-full px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition text-sm font-semibold"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
