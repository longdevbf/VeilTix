"use client"

import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { SapphireWalletConnect } from "./SapphireWalletConnect"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { label: "Create", href: "/create" },
    { label: "Events", href: "/events" },
    { label: "Check-in", href: "/check-in" },
    { label: "Market", href: "/market" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ]

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
          {navItems.map((item) => {
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

        {/* Wallet */}
        <div className="hidden md:flex">
          <SapphireWalletConnect />
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
          {navItems.map((item) => {
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

          <div className="pt-4 border-t border-orange-500/20">
            <SapphireWalletConnect />
          </div>
        </div>
      )}
    </header>
  )
}