"use client"

import { motion, useScroll, useTransform } from "motion/react"
import { ArrowRight, Ticket, Shield, Zap, Globe, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRef } from "react"
import { PageBg } from "@/components/ui/page-bg"
import {
  FloatingTicket, OrbitRing, GlassStatCard,
} from "@/components/ui/scene-3d"

// ── Variants ─────────────────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <PageBg variant="default" particles />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center bg-white overflow-hidden"
      >
        {/* Morphing blobs */}
        <motion.div
          animate={{ x: [0, 22, -10, 0], y: [0, -16, 10, 0], scale: [1, 1.1, 0.96, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-56 -right-56 w-[750px] h-[750px] rounded-full bg-orange-100/60 blur-3xl animate-morph"
          style={{ animationDuration: "18s" }}
        />
        <motion.div
          animate={{ x: [0, -18, 12, 0], y: [0, 14, -8, 0], scale: [1, 0.96, 1.07, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="pointer-events-none absolute -bottom-52 -left-52 w-[600px] h-[600px] rounded-full bg-orange-50/90 blur-3xl animate-morph animation-delay-2000"
          style={{ animationDuration: "22s" }}
        />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Left col ─────────────────────────────────────────────── */}
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className="mb-7">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full">
                  <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Web3 Ticketing Platform
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-[1.06] tracking-tight">
                Secure Tickets<br />on the{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    Blockchain
                  </span>
                  <motion.span
                    animate={{ scaleX: [0, 1] }} transition={{ duration: 0.9, delay: 1, ease: "easeOut" }}
                    style={{ originX: 0 }}
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                  />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-xl text-gray-500 mb-9 max-w-lg leading-relaxed">
                VeilTix revolutionizes event ticketing with blockchain. Buy, sell, and verify NFT tickets with complete transparency.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-12">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link href="/create" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors shadow-xl shadow-orange-500/30 text-base">
                    Create Event <ArrowRight size={18} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link href="/events" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm text-base">
                    Browse Events
                  </Link>
                </motion.div>
              </motion.div>

              {/* Glass stat cards */}
              <motion.div variants={stagger} className="grid grid-cols-3 gap-3 max-w-sm">
                <GlassStatCard value="1M+" label="Users"  delay={0.4} />
                <GlassStatCard value="50K+" label="Events" delay={0.5} />
                <GlassStatCard value="99.9%" label="Uptime" delay={0.6} />
              </motion.div>
            </motion.div>

            {/* ── Right col: 3D Scene ───────────────────────────────────── */}
            <div className="relative hidden lg:block" style={{ height: 520, perspective: 1400 }}>

              {/* Ambient glow */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-orange-300/25 blur-3xl pointer-events-none"
              />

              {/* Orbit ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <OrbitRing radius={190} duration={14} dotColor="#f97316" count={3} />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <OrbitRing radius={230} duration={22} dotColor="#fb923c" count={2} />
              </div>

              {/* ── Main (large) ticket ── */}
              <FloatingTicket
                delay={0} tiltX={14} tiltZ={-8}
                translateX={190} translateY={-40}
                width={310} height={180} tokenId="042" label="NFT Ticket"
              />
              {/* ── Mid ticket ── */}
              <FloatingTicket
                delay={0.5} tiltX={-7} tiltZ={13}
                translateX={260} translateY={105}
                width={262} height={153} tokenId="017" label="VIP Ticket"
              />
              {/* ── Small ticket ── */}
              <FloatingTicket
                delay={1} tiltX={9} tiltZ={-16}
                translateX={120} translateY={145}
                width={214} height={125} tokenId="088" label="General"
                opacity={0.88}
              />

              {/* Sparkle dots */}
              {[
                { top: "8%",  right: "22%", delay: 0 },
                { top: "42%", right: "6%",  delay: 1.1 },
                { top: "70%", right: "18%", delay: 2 },
                { top: "22%", left: "8%",   delay: 0.6 },
                { top: "58%", left: "14%",  delay: 1.8 },
              ].map((s, i) => (
                <motion.div key={i}
                  animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
                  style={s as any}
                  className="absolute w-2.5 h-2.5 rounded-full bg-orange-400"
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 1.6, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-300">
          <div className="w-5 h-8 border-2 border-gray-300 rounded-full flex justify-center pt-1.5">
            <motion.div animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
              className="w-1 h-1.5 bg-gray-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <p className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-3">Why VeilTix</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Built for the Future</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Industry-leading features for creators and attendees</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Immutable Security", desc: "Blockchain-backed tickets that cannot be forged or duplicated.", color: "bg-blue-50 text-blue-500", glow: "#3b82f6" },
              { icon: Zap, title: "Instant Transfers", desc: "Transfer tickets instantly without intermediaries. Lightning-fast.", color: "bg-yellow-50 text-yellow-500", glow: "#f59e0b" },
              { icon: TrendingUp, title: "Secondary Market", desc: "Transparent marketplace with creator royalties built-in.", color: "bg-green-50 text-green-500", glow: "#10b981" },
              { icon: Ticket, title: "Smart Ticketing", desc: "Programmable tickets with special perks and dynamic content.", color: "bg-purple-50 text-purple-500", glow: "#8b5cf6" },
              { icon: Globe, title: "Global Reach", desc: "Accept payments from anywhere. No geographic limitations.", color: "bg-cyan-50 text-cyan-500", glow: "#06b6d4" },
              { icon: Shield, title: "Fraud Prevention", desc: "Advanced verification prevents counterfeit tickets.", color: "bg-orange-50 text-orange-500", glow: "#f97316" },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8, boxShadow: `0 24px 48px -12px ${f.glow}22` }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 cursor-default transition-shadow"
                  style={{ boxShadow: "0 4px 16px -4px rgba(0,0,0,0.06)" }}
                >
                  <motion.div whileHover={{ rotate: [0, -12, 12, 0], scale: 1.12 }} transition={{ duration: 0.4 }}
                    className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-4`}>
                    <Icon size={22} />
                  </motion.div>
                  <h3 className="text-gray-900 font-black text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <p className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">How It Works</h2>
            <p className="text-gray-500 text-lg">Simple steps to create and manage events</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3 }} style={{ originX: 0 }}
              className="hidden md:block absolute top-10 left-[13%] right-[13%] h-px bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200" />

            {[
              { n: "01", title: "Connect Wallet", desc: "Link your crypto wallet to get started", delay: 0 },
              { n: "02", title: "Create Event", desc: "Set up event details and ticket types", delay: 0.15 },
              { n: "03", title: "Mint Tickets", desc: "Generate NFT tickets on blockchain", delay: 0.3 },
              { n: "04", title: "Sell & Manage", desc: "Manage sales and attendee check-in", delay: 0.45 },
            ].map((step) => (
              <motion.div key={step.n}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: step.delay }}
                className="relative flex flex-col items-center text-center"
              >
                <motion.div whileHover={{ scale: 1.12, rotate: [0, -4, 4, 0] }} transition={{ duration: 0.35 }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-5 relative z-10"
                  style={{ background: "linear-gradient(135deg, #fb923c, #c2410c)", boxShadow: "0 12px 32px -8px rgba(249,115,22,0.5)" }}>
                  {step.n}
                  <motion.div animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: parseFloat(step.n) * 0.4 }}
                    className="absolute inset-0 rounded-2xl border-2 border-orange-400" />
                </motion.div>
                <h3 className="text-gray-900 font-black text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #b45309 100%)" }}
      >
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full border-2 border-white/10" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full border-2 border-white/10" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -translate-y-1/2 right-[10%] w-40 h-40 rounded-full border border-white/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto text-center">
          <motion.div animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-6">
            <Ticket size={52} className="text-white/80 mx-auto" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
            Ready to Transform Your Events?
          </h2>
          <p className="text-orange-100 text-lg mb-10 max-w-xl mx-auto">
            Join thousands using VeilTix for secure, transparent blockchain ticketing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
              <Link href="/create" className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-white text-orange-600 font-black rounded-2xl hover:bg-orange-50 transition-colors shadow-xl text-base">
                Start Creating <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
              <Link href="/events" className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-orange-400/30 border border-white/30 text-white font-semibold rounded-2xl hover:bg-orange-400/40 transition-colors text-base">
                Browse Events
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
}
