"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { WalletButton } from "./wallet-button"
import { VeilTixLogo } from "./logo"
import { RosePriceTicker, OasisLogo } from "./rose-price-ticker"

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">

        {/* ── Left: Logo ───────────────────────────────────────── */}
        <div className="flex-shrink-0">
          <VeilTixLogo size={34} />
        </div>

        {/* ── Center: Nav links ─────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-orange-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* ── Right: Oasis badge + ROSE price + Wallet ─────────── */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
          {/* Oasis Network badge */}
          <motion.a
            href="https://oasisprotocol.org"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#E8FFFE] to-[#EEF4FF] border border-[#00CFBE]/30 rounded-xl text-xs font-semibold text-[#00CFBE] hover:border-[#00CFBE]/60 transition-all"
            title="Powered by Oasis Sapphire"
          >
            <OasisLogo size={15} />
            <span className="text-gray-600 font-medium hidden lg:inline">Oasis</span>
            <span className="text-[10px] text-[#00CFBE] font-bold bg-[#00CFBE]/10 px-1.5 py-0.5 rounded-md">SAPPHIRE</span>
          </motion.a>

          {/* ROSE Price Ticker */}
          <RosePriceTicker />

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200" />

          {/* Wallet */}
          <WalletButton />
        </div>

        {/* Mobile toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </motion.button>
      </nav>

      {/* ── Mobile Menu ───────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item, i) => {
                const active = isActive(item.href)
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active ? "text-orange-500 bg-orange-50" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Mobile: Oasis + ROSE */}
            <div className="px-4 py-2 flex items-center gap-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#E8FFFE] to-[#EEF4FF] border border-[#00CFBE]/30 rounded-xl text-xs font-semibold">
                <OasisLogo size={14} />
                <span className="text-gray-600">Oasis Sapphire</span>
              </div>
              <RosePriceTicker />
            </div>

            <div className="px-4 pb-4 pt-2">
              <WalletButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
