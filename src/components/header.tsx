"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { WalletButton } from "./wallet-button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-orange-500/20">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          VeilTix
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/create" className="text-white/80 hover:text-orange-400 transition">
            Create
          </Link>
          <Link href="/events" className="text-white/80 hover:text-orange-400 transition">
            Events
          </Link>
          <Link href="/check-in" className="text-white/80 hover:text-orange-400 transition">
            Check-in
          </Link>
          <Link href="/market" className="text-white/80 hover:text-orange-400 transition">
            Market
          </Link>
          <Link href="/about" className="text-white/80 hover:text-orange-400 transition">
            About Us
          </Link>
          <Link href="/contact" className="text-white/80 hover:text-orange-400 transition">
            Contact
          </Link>
        </div>

        {/* Wallet Button */}
        <div className="hidden md:flex">
          <WalletButton />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-orange-500/20 py-4 px-6 space-y-4">
          <Link href="/create" className="block text-white/80 hover:text-orange-400 transition">
            Create
          </Link>
          <Link href="/events" className="block text-white/80 hover:text-orange-400 transition">
            Events
          </Link>
          <Link href="/check-in" className="block text-white/80 hover:text-orange-400 transition">
            Check-in
          </Link>
          <Link href="/market" className="block text-white/80 hover:text-orange-400 transition">
            Market
          </Link>
          <Link href="/about" className="block text-white/80 hover:text-orange-400 transition">
            About Us
          </Link>
          <Link href="/contact" className="block text-white/80 hover:text-orange-400 transition">
            Contact
          </Link>
          <div className="pt-4 border-t border-orange-500/20">
            <WalletButton />
          </div>
        </div>
      )}
    </header>
  )
}
