"use client"

import { motion } from "motion/react"
import { Ticket, QrCode, Shield, Zap } from "lucide-react"

// ── Shared helpers ───────────────────────────────────────────────────────────
const QR_MASK = [1,1,0,1,0,1,0,1,1,1,1,0,0,1,0,0,1,0,1,0,1,1,0,1,1]

// ── Single floating 3D ticket ────────────────────────────────────────────────
export function FloatingTicket({
  delay = 0,
  tiltX = 0,
  tiltZ = 0,
  translateX = 0,
  translateY = 0,
  width = 260,
  height = 152,
  tokenId = "042",
  label = "NFT Ticket",
  opacity = 1,
}: {
  delay?: number; tiltX?: number; tiltZ?: number; translateX?: number; translateY?: number;
  width?: number; height?: number; tokenId?: string; label?: string; opacity?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.88 }}
      animate={{
        opacity,
        y: [translateY, translateY - 13, translateY],
        rotateX: [tiltX - 2, tiltX + 2, tiltX - 2],
        rotateZ: [tiltZ - 1.5, tiltZ + 1.5, tiltZ - 1.5],
      }}
      transition={{
        opacity: { duration: 0.7, delay },
        y: { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay },
        rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: delay + 0.3 },
        rotateZ: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: delay + 0.6 },
      }}
      style={{ x: translateX, transformStyle: "preserve-3d" }}
      className="absolute"
    >
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          width, height,
          background: "linear-gradient(135deg, #fb923c 0%, #ea580c 55%, #b45309 100%)",
          boxShadow: "0 25px 50px -10px rgba(249,115,22,0.45), 0 10px 20px -8px rgba(0,0,0,0.2)",
        }}
      >
        {/* Left notch */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-50" />
        {/* Right notch */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-50" />
        {/* Dashed separator */}
        <div className="absolute inset-x-5 top-1/2 border-t border-dashed border-white/25" />
        {/* Diagonal stripe pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "8px 8px" }} />
        {/* Shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/18 via-transparent to-transparent pointer-events-none" />

        {/* Content */}
        <div className="p-4 h-full flex flex-col justify-between relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-200 text-[9px] font-bold uppercase tracking-[0.15em]">VeilTix</p>
              <p className="text-white font-bold text-sm leading-tight mt-0.5">{label}</p>
            </div>
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Ticket size={14} className="text-white" />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-orange-200/80 text-[8px] uppercase tracking-widest font-semibold">Token ID</p>
              <p className="text-white font-mono font-bold text-xs mt-0.5">#{tokenId}</p>
            </div>
            {/* Mini QR */}
            <div className="w-9 h-9 bg-white/20 rounded-lg grid grid-cols-5 gap-[1.5px] p-1 border border-white/20">
              {QR_MASK.map((on, i) => (
                <div key={i} className={`rounded-[1px] ${on ? "bg-white/90" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Stack of tickets for page headers ───────────────────────────────────────
export function TicketStack({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: 200, height: 180, perspective: 1000 }}>
      {/* Back */}
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [-12, -10, -12] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute"
        style={{ width: 160, height: 93, left: 20, top: 40,
          background: "linear-gradient(135deg, #fdba74, #f97316)",
          borderRadius: 14, boxShadow: "0 8px 24px -4px rgba(249,115,22,0.3)",
          opacity: 0.6,
        }}
      />
      {/* Mid */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [-4, -2, -4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        className="absolute"
        style={{ width: 172, height: 100, left: 14, top: 28,
          background: "linear-gradient(135deg, #fb923c, #ea580c)",
          borderRadius: 14, boxShadow: "0 10px 30px -6px rgba(249,115,22,0.35)",
          opacity: 0.8,
        }}
      />
      {/* Front */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [5, 7, 5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute overflow-hidden"
        style={{ width: 186, height: 108, left: 7, top: 10,
          background: "linear-gradient(135deg, #fb923c, #c2410c)",
          borderRadius: 14, boxShadow: "0 16px 36px -8px rgba(249,115,22,0.5)",
        }}
      >
        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-50 opacity-80" />
        <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-50 opacity-80" />
        <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-white/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
        <div className="p-3 relative z-10 h-full flex flex-col justify-between">
          <div>
            <p className="text-orange-100 text-[8px] font-bold uppercase tracking-widest">VeilTix</p>
            <p className="text-white font-bold text-xs mt-0.5">NFT Ticket</p>
          </div>
          <p className="text-orange-200 font-mono text-[9px] font-semibold">#00042</p>
        </div>
      </motion.div>

      {/* Glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(249,115,22,0.25) 0%, transparent 70%)", filter: "blur(8px)" }}
      />
    </div>
  )
}

// ── 3D NFT Card (for profile / marketplace) ──────────────────────────────────
export function NFTCardIllustration({
  delay = 0,
  className = "",
}: { delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      transition={{ opacity: { delay, duration: 0.6 }, y: { delay, duration: 4, repeat: Infinity, ease: "easeInOut" } }}
      className={`relative ${className}`}
      style={{
        width: 140, height: 190,
        background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
        borderRadius: 18,
        boxShadow: "0 20px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {/* Top colored bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[18px]"
        style={{ background: "linear-gradient(90deg, #fb923c, #ea580c)" }} />
      {/* Image area */}
      <div className="mx-3 mt-3 h-20 rounded-xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #fb923c20, #fb923c40)" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-full h-full flex items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full"
            style={{ background: "linear-gradient(135deg, #fb923c, #c2410c)", opacity: 0.7 }} />
        </motion.div>
      </div>
      {/* Info */}
      <div className="px-3 py-2.5 space-y-1.5">
        <div className="h-2 rounded-full w-3/4" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="h-1.5 rounded-full w-1/2" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
      {/* Price badge */}
      <div className="absolute bottom-3 left-3 right-3 rounded-xl px-3 py-2"
        style={{ background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.3)" }}>
        <p style={{ color: "#fb923c", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>PRICE</p>
        <p style={{ color: "white", fontSize: 12, fontWeight: 800, fontFamily: "monospace" }}>0.05 ROSE</p>
      </div>
      {/* Shine */}
      <div className="absolute inset-0 rounded-[18px] pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)" }} />
    </motion.div>
  )
}

// ── Spinning ROSE coin ───────────────────────────────────────────────────────
export function RoseCoin({ size = 64, delay = 0 }: { size?: number; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, rotateY: 360, y: [0, -6, 0] }}
      transition={{
        opacity: { delay, duration: 0.6 },
        rotateY: { duration: 4, repeat: Infinity, ease: "linear", delay },
        y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 },
      }}
      style={{ width: size, height: size, transformStyle: "preserve-3d" }}
    >
      <div className="w-full h-full rounded-full flex items-center justify-center relative"
        style={{
          background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #b45309 100%)",
          boxShadow: "0 8px 24px -4px rgba(249,115,22,0.6), inset 0 2px 4px rgba(255,255,255,0.2)",
        }}>
        <p className="text-white font-black text-xs tracking-tight select-none">ROSE</p>
        <div className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)" }} />
      </div>
    </motion.div>
  )
}

// ── Verified badge 3D ────────────────────────────────────────────────────────
export function VerifiedBadge({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
      transition={{
        opacity: { delay, duration: 0.5 },
        scale: { delay, duration: 0.5, type: "spring", stiffness: 200 },
        y: { delay, duration: 3.5, repeat: Infinity, ease: "easeInOut" },
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold select-none"
      style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.1) 100%)",
        border: "1px solid rgba(16,185,129,0.3)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 16px -4px rgba(16,185,129,0.3)",
      }}
    >
      <Shield size={12} style={{ color: "#10b981" }} />
      <span style={{ color: "#10b981" }}>Verified on-chain</span>
    </motion.div>
  )
}

// ── Lightning bolt 3D badge ──────────────────────────────────────────────────
export function FastBadge({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
      transition={{
        opacity: { delay, duration: 0.5 },
        scale: { delay, type: "spring", stiffness: 200 },
        y: { delay: delay + 0.3, duration: 4, repeat: Infinity, ease: "easeInOut" },
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold select-none"
      style={{
        background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))",
        border: "1px solid rgba(245,158,11,0.3)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 16px -4px rgba(245,158,11,0.3)",
      }}
    >
      <Zap size={12} style={{ color: "#f59e0b" }} />
      <span style={{ color: "#d97706" }}>Instant transfer</span>
    </motion.div>
  )
}

// ── Orbiting particle ring ───────────────────────────────────────────────────
export function OrbitRing({
  radius = 160,
  duration = 12,
  dotColor = "#fb923c",
  count = 3,
}: {
  radius?: number; duration?: number; dotColor?: string; count?: number
}) {
  return (
    <div className="absolute pointer-events-none" style={{ width: radius * 2, height: radius * 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: duration + i * 2, repeat: Infinity, ease: "linear", delay: (duration / count) * i }}
          className="absolute inset-0"
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: 8 - i * 1.5, height: 8 - i * 1.5, background: dotColor, opacity: 0.7 - i * 0.15,
              boxShadow: `0 0 ${12 - i * 3}px ${dotColor}` }}
          />
        </motion.div>
      ))}
    </div>
  )
}

// ── Glassmorphism stat card (for hero sections) ──────────────────────────────
export function GlassStatCard({
  value,
  label,
  delay = 0,
}: { value: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.06, y: -4 }}
      className="flex flex-col items-center px-5 py-4 rounded-2xl select-none cursor-default"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(249,115,22,0.15)",
        boxShadow: "0 4px 20px -6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      <p className="text-2xl font-black text-orange-500">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    </motion.div>
  )
}
