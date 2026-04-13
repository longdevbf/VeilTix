"use client"

import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, User } from "lucide-react"
import { SapphireWalletConnect } from "./SapphireWalletConnect"
import { useWallet } from "./context/walletContext"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isConnected, isLoading } = useWallet()

  const navItems = [
    { label: "Create", href: "/create", role: "organizer" },
    { label: "Events", href: "/events" },
    { label: "Check-in", href: "/check-in", role: "organizer" },
    { label: "Market", href: "/market" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ]

  const filteredNavItems = navItems.filter(item => {
    if (!item.role) return true;
    if (!user) return false;
    return user.role === item.role;
  });

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-orange-500/20">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/veiltix-logo.png"
            alt="VeilTix Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            VeilTix
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {filteredNavItems.map((item) => {
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-lg font-medium transition duration-300 ${
                  active
                    ? "text-orange-400"
                    : "text-white/80 hover:text-orange-300"
                }`}
              >
                {item.label}

                {/* underline + glow */}
                {active && (
                  <>
                    <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-orange-500 rounded-full" />
                    <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-orange-500 blur-sm opacity-80" />
                  </>
                )}
              </Link>
            )
          })}
        </div>

        {/* Wallet & Profile */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
               <div className="text-right">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{user.role}</p>
                  <p className="text-xs text-white/80 max-w-[120px] truncate">{user.email}</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                  <User size={16} />
               </div>
               <SapphireWalletConnect />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-white/60 hover:text-white font-bold transition">
                Sign In
              </Link>
              <Link href="/register" className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition shadow-lg shadow-orange-500/20">
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
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
          {filteredNavItems.map((item) => {
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-2 py-2 rounded-md transition ${
                  active
                    ? "text-orange-400 bg-orange-500/10"
                    : "text-white/80 hover:text-orange-300"
                }`}
              >
                {item.label}
              </Link>
            )
          })}

          <div className="pt-4 border-t border-orange-500/20 flex flex-col gap-4">
            {user && (
               <div className="text-sm text-white/60">
                  Logged in as <span className="text-orange-400">{user.email}</span> ({user.role})
               </div>
            )}
            <SapphireWalletConnect />
          </div>
        </div>
      )}
    </header>
  )
}
