"use client"

import { useRef, useState, ReactNode } from "react"
import { motion, useSpring, useTransform } from "motion/react"

interface TiltCardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  intensity?: number
  glare?: boolean
  scale?: number
}

export function TiltCard({
  children,
  className = "",
  style,
  intensity = 14,
  glare = true,
  scale = 1.02,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })

  const rx = useSpring(0, { stiffness: 350, damping: 30 })
  const ry = useSpring(0, { stiffness: 350, damping: 30 })
  const sc = useSpring(1, { stiffness: 350, damping: 30 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const nx = (e.clientX - left) / width - 0.5
    const ny = (e.clientY - top) / height - 0.5
    rx.set(-ny * intensity)
    ry.set(nx * intensity)
    setGlarePos({ x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 })
  }

  const onEnter = () => { setHovered(true); sc.set(scale) }
  const onLeave = () => { setHovered(false); rx.set(0); ry.set(0); sc.set(1) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, scale: sc, transformStyle: "preserve-3d", ...style }}
      className={`relative ${className}`}
    >
      {children}

      {/* Glare highlight that follows cursor */}
      {glare && (
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.13) 0%, transparent 55%)`,
          }}
        />
      )}
    </motion.div>
  )
}
