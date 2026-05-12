"use client"

import { motion, AnimatePresence } from "motion/react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useRosePrice } from "@/hooks/use-rose-price"
import { useId } from "react"

// ── Oasis / ROSE logo ────────────────────────────────────────────────────────
function OasisLogo({ size = 18 }: { size?: number }) {
  const uid = useId().replace(/:/g, "")
  const gId = `oasis-g-${uid}`

  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00CFBE" />
          <stop offset="1" stopColor="#006DFF" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="14" cy="14" r="11" stroke={`url(#${gId})`} strokeWidth="2.5" fill="none" />
      {/* Inner solid circle */}
      <circle cx="14" cy="14" r="4.5" fill={`url(#${gId})`} />
      {/* 4 network spokes */}
      <line x1="14" y1="3"  x2="14" y2="9"  stroke={`url(#${gId})`} strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="19" x2="14" y2="25" stroke={`url(#${gId})`} strokeWidth="2" strokeLinecap="round" />
      <line x1="3"  y1="14" x2="9"  y2="14" stroke={`url(#${gId})`} strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="14" x2="25" y2="14" stroke={`url(#${gId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ── Main ticker component ────────────────────────────────────────────────────
export function RosePriceTicker() {
  const { usd, change24h, loading } = useRosePrice()

  const isPositive = (change24h ?? 0) >= 0
  const isNeutral  = change24h === null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold select-none"
      title="ROSE token price — updates every 60s via CoinGecko"
    >
      <OasisLogo size={16} />

      <span className="text-gray-500 font-medium">ROSE</span>

      {loading ? (
        <span className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
      ) : usd === null ? (
        <span className="text-gray-400">—</span>
      ) : (
        <AnimatePresence mode="wait">
          <motion.span
            key={usd}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            className="text-gray-900 tabular-nums"
          >
            ${usd < 0.01 ? usd.toFixed(5) : usd.toFixed(4)}
          </motion.span>
        </AnimatePresence>
      )}

      {!loading && change24h !== null && (
        <span className={`flex items-center gap-0.5 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
          {isNeutral
            ? <Minus size={11} />
            : isPositive
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />}
          {Math.abs(change24h).toFixed(2)}%
        </span>
      )}

      {/* Live dot */}
      <span className="relative flex h-1.5 w-1.5 ml-0.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
      </span>
    </motion.div>
  )
}

// Export the logo separately for use in header
export { OasisLogo }
