"use client"

import { motion } from "motion/react"

// ── Blob shapes config ───────────────────────────────────────────────────────
const BLOBS = {
  default: [
    { top: "-16rem", right: "-16rem", w: 600, h: 600, color: "bg-orange-100/60", dur: 18, delay: 0 },
    { bottom: "-16rem", left: "-16rem", w: 500, h: 500, color: "bg-orange-50/80", dur: 24, delay: 5 },
  ],
  events: [
    { top: "-10rem", right: "-10rem", w: 500, h: 500, color: "bg-orange-100/50", dur: 20, delay: 0 },
    { bottom: "-12rem", left: "-12rem", w: 440, h: 440, color: "bg-amber-50/70", dur: 26, delay: 6 },
    { top: "30%", left: "60%", w: 320, h: 320, color: "bg-orange-50/40", dur: 30, delay: 10 },
  ],
  create: [
    { top: "-14rem", right: "-10rem", w: 500, h: 500, color: "bg-orange-100/50", dur: 22, delay: 0 },
    { bottom: "-10rem", left: "-14rem", w: 400, h: 400, color: "bg-amber-100/40", dur: 28, delay: 7 },
  ],
  market: [
    { top: "-12rem", right: "-12rem", w: 480, h: 480, color: "bg-orange-100/45", dur: 19, delay: 0 },
    { bottom: "-14rem", left: "-8rem", w: 420, h: 420, color: "bg-yellow-50/60", dur: 25, delay: 4 },
    { top: "50%", right: "5%", w: 280, h: 280, color: "bg-orange-50/35", dur: 32, delay: 12 },
  ],
  profile: [
    { top: "-16rem", right: "-12rem", w: 520, h: 520, color: "bg-orange-100/40", dur: 22, delay: 0 },
    { bottom: "-12rem", left: "-16rem", w: 460, h: 460, color: "bg-amber-50/50", dur: 27, delay: 6 },
  ],
  checkin: [
    { top: "-12rem", right: "-10rem", w: 440, h: 440, color: "bg-orange-100/45", dur: 20, delay: 0 },
    { bottom: "-10rem", left: "-12rem", w: 380, h: 380, color: "bg-orange-50/60", dur: 24, delay: 5 },
  ],
}

// ── Floating Particles ───────────────────────────────────────────────────────
const PARTICLES = [
  { top: "15%", right: "8%",  size: 6, dur: 5,  delay: 0   },
  { top: "35%", right: "3%",  size: 4, dur: 7,  delay: 1.5 },
  { top: "65%", right: "12%", size: 5, dur: 6,  delay: 3   },
  { top: "80%", right: "6%",  size: 3, dur: 8,  delay: 0.8 },
  { top: "20%", left: "5%",   size: 4, dur: 6,  delay: 2.2 },
  { top: "55%", left: "8%",   size: 5, dur: 9,  delay: 4   },
  { top: "45%", left: "2%",   size: 3, dur: 5,  delay: 1   },
]

// ── Grid dots ────────────────────────────────────────────────────────────────
function GridDots() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: "radial-gradient(circle, #f97316 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export function PageBg({
  variant = "default",
  grid = false,
  particles = true,
}: {
  variant?: keyof typeof BLOBS
  grid?: boolean
  particles?: boolean
}) {
  const blobs = BLOBS[variant] ?? BLOBS.default

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Grid dots */}
      {grid && <GridDots />}

      {/* Animated blobs */}
      {blobs.map((blob, i) => {
        const style: React.CSSProperties = {
          width: blob.w,
          height: blob.h,
          top: (blob as any).top,
          right: (blob as any).right,
          bottom: (blob as any).bottom,
          left: (blob as any).left,
        }

        return (
          <motion.div
            key={i}
            animate={{
              x:     [0, i % 2 === 0 ? 18 : -15, i % 2 === 0 ? -10 : 12, 0],
              y:     [0, i % 2 === 0 ? -14 : 16,  i % 2 === 0 ? 8  : -10, 0],
              scale: [1, 1 + 0.04 * (i + 1), 0.97, 1],
            }}
            transition={{
              duration: blob.dur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: blob.delay,
            }}
            className={`absolute rounded-full blur-3xl ${blob.color}`}
            style={style}
          />
        )
      })}

      {/* Floating particles */}
      {particles &&
        PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.15, 0.5, 0.15],
              scale:   [0.7, 1.3, 0.7],
              y:       [0, -10, 0],
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-orange-400"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              right: (p as any).right,
              left: (p as any).left,
            }}
          />
        ))}
    </div>
  )
}
