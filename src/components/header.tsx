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
  const [profileOpen, setProfileOpen] = useState(false)
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
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${
                  profileOpen 
                    ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20" 
                    : "bg-white/5 border-white/10 text-white hover:border-orange-500/50"
                }`}
              >
                <User size={20} />
              </button>

              {profileOpen && (
                <>
                  {/* Backdrop for closing */}
                  <div className="fixed inset-0 z-[-1]" onClick={() => setProfileOpen(false)} />
                  
                  <div className="absolute right-0 mt-4 w-72 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="mb-6 pb-6 border-b border-white/5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                          <User size={24} />
                        </div>
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-orange-500/10 text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-1">
                            {user.role}
                          </span>
                          <p className="text-sm font-bold text-white max-w-[160px] truncate">
                            {user.email.split('@')[0]}
                          </p>
                          <p className="text-[10px] text-white/40 truncate italic">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Connected Wallet</p>
                      <SapphireWalletConnect />
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-2">
                       <Link href="/profile" className="w-full py-2.5 text-center text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition">
                          View Profile
                       </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-white/60 hover:text-white font-bold transition text-sm">
                Sign In
              </Link>
              <Link href="/register" className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-bold transition shadow-lg shadow-orange-500/20">
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
