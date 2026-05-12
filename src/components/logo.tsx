"use client"

import { useId } from "react"
import { motion } from "motion/react"
import Link from "next/link"

// ── Logo Mark (icon only) ────────────────────────────────────────────────────
export function VeilTixMark({ size = 40, animated = false }: { size?: number; animated?: boolean }) {
  const uid = useId().replace(/:/g, "")
  const bgId   = `vt-bg-${uid}`
  const shineId = `vt-shine-${uid}`
  const glowId  = `vt-glow-${uid}`

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id={bgId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c" />
          <stop offset="0.5" stopColor="#f97316" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>

        {/* Top shine */}
        <linearGradient id={shineId} x1="0" y1="0" x2="0" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.22" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Glow filter */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset dx="0" dy="1" result="offset" />
          <feComposite in="SourceGraphic" in2="offset" operator="over" />
        </filter>
      </defs>

      {/* Shadow backdrop */}
      <rect x="2" y="3" width="44" height="44" rx="11" fill="#92400e" fillOpacity="0.3" />

      {/* Background pill */}
      <rect width="48" height="48" rx="11" fill={`url(#${bgId})`} />

      {/* Shine overlay (top half only) */}
      <rect width="48" height="26" rx="11" fill={`url(#${shineId})`} />

      {/* ── V Shape ────────────────────────────────────────────────────── */}
      {/* Main V polygon: 6-point shape with arm width ~11px */}
      <polygon
        points="7,12 18,12 24,34 30,12 41,12 24,40"
        fill="white"
        filter={`url(#${glowId})`}
      />

      {/* Ticket-notch circles punched through each arm */}
      <circle cx="13.5" cy="22" r="2.8" fill={`url(#${bgId})`} />
      <circle cx="34.5" cy="22" r="2.8" fill={`url(#${bgId})`} />

      {/* Small diamond accent at V convergence */}
      <rect
        x="22.5"
        y="36"
        width="3"
        height="3"
        rx="0.8"
        transform="rotate(45 24 37.5)"
        fill="white"
        fillOpacity="0.5"
      />
    </svg>
  )

  if (!animated) return mark

  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: -2 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {mark}
    </motion.div>
  )
}

// ── Full Logo (mark + wordmark) ──────────────────────────────────────────────
export function VeilTixLogo({
  size = 36,
  href = "/",
  className = "",
}: {
  size?: number
  href?: string
  className?: string
}) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 group ${className}`}>
      <VeilTixMark size={size} animated />

      {/* Wordmark */}
      <motion.span
        initial={false}
        whileHover="hover"
        className="text-xl font-extrabold tracking-tight select-none"
        style={{ fontFeatureSettings: "'ss01' on" }}
      >
        <span className="text-gray-900 group-hover:text-gray-800 transition-colors">Veil</span>
        <motion.span
          variants={{ hover: { color: "#ea580c" } }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
        >
          Tix
        </motion.span>
      </motion.span>
    </Link>
  )
}
