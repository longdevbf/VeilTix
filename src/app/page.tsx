"use client"

import { ArrowRight, Ticket, Shield, Zap, Globe, TrendingUp } from "lucide-react"
import { ShimmerButton } from "@/components/shimmer-button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background SVG with animated elements */}
        <div className="absolute inset-0">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="neonPulse1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                <stop offset="30%" stopColor="rgba(251,146,60,1)" />
                <stop offset="70%" stopColor="rgba(249,115,22,0.8)" />
                <stop offset="100%" stopColor="rgba(249,115,22,0)" />
              </radialGradient>
              <radialGradient id="neonPulse2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="25%" stopColor="rgba(251,146,60,0.9)" />
                <stop offset="60%" stopColor="rgba(234,88,12,0.7)" />
                <stop offset="100%" stopColor="rgba(234,88,12,0)" />
              </radialGradient>
              <linearGradient id="threadFade1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,0,0,1)" />
                <stop offset="15%" stopColor="rgba(249,115,22,0.8)" />
                <stop offset="85%" stopColor="rgba(249,115,22,0.8)" />
                <stop offset="100%" stopColor="rgba(0,0,0,1)" />
              </linearGradient>
              <filter id="neonGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Animated threads */}
            <path
              id="thread1"
              d="M50 700 Q250 500 600 400 Q800 300 1200 250"
              stroke="url(#threadFade1)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            <circle r="2.5" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="6s" repeatCount="indefinite">
                <mpath href="#thread1" />
              </animateMotion>
            </circle>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-full text-orange-400 text-sm font-semibold">
              ✨ Web3 Ticketing Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Secure Event Tickets on the{" "}
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Blockchain
            </span>
          </h1>

          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            VeilTix revolutionizes event ticketing with blockchain technology. Buy, sell, and verify tickets with complete transparency and security.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <ShimmerButton
              background="linear-gradient(135deg, rgb(251,146,60) 0%, rgb(234,88,12) 100%)"
              shimmerColor="#ffffff"
              shimmerDuration="2s"
            >
              <Link href="/create" className="flex items-center gap-2">
                Create Event
                <ArrowRight size={18} />
              </Link>
            </ShimmerButton>

            <button className="px-8 py-3 border border-orange-500/50 text-orange-400 rounded-lg hover:bg-orange-500/10 transition font-semibold">
              <Link href="/events" className="flex items-center gap-2">
                Browse Events
              </Link>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-white/60 text-sm">
            <div>
              <p className="font-bold text-orange-400">1M+</p>
              <p>Active Users</p>
            </div>
            <div>
              <p className="font-bold text-orange-400">50K+</p>
              <p>Events</p>
            </div>
            <div>
              <p className="font-bold text-orange-400">99.9%</p>
              <p>Secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                VeilTix
              </span>
            </h2>
            <p className="text-white/60 text-lg">
              Industry-leading features for event creators and attendees
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <Shield className="text-orange-400" size={24} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Immutable Security</h3>
              <p className="text-white/60">
                Blockchain-backed tickets that cannot be forged or duplicated. Complete transparency and authenticity.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <Zap className="text-orange-400" size={24} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Instant Transfers</h3>
              <p className="text-white/60">
                Transfer tickets instantly to friends and family without intermediaries. Lightning-fast transactions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <TrendingUp className="text-orange-400" size={24} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Secondary Market</h3>
              <p className="text-white/60">
                Transparent marketplace for reselling tickets at fair prices. Creator royalties built-in.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <Ticket className="text-orange-400" size={24} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Smart Ticketing</h3>
              <p className="text-white/60">
                Programmable tickets with special perks, access levels, and dynamic content.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <Globe className="text-orange-400" size={24} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Global Reach</h3>
              <p className="text-white/60">
                Accept payments from anywhere. No geographic limitations or hidden fees.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <Shield className="text-orange-400" size={24} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Fraud Prevention</h3>
              <p className="text-white/60">
                Advanced verification system prevents counterfeit tickets and scalping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-black via-black to-orange-950/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-white/60 text-lg">
              Simple steps to create and manage events
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: "1", title: "Connect Wallet", description: "Link your crypto wallet to get started" },
              { number: "2", title: "Create Event", description: "Set up event details and ticket types" },
              { number: "3", title: "Mint Tickets", description: "Generate NFT tickets on blockchain" },
              { number: "4", title: "Sell & Manage", description: "Manage sales and attendee check-in" },
            ].map((step) => (
              <div key={step.number} className="relative">
                <div className="p-6 rounded-lg border border-orange-500/30 bg-orange-500/5">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-white/60 text-sm">{step.description}</p>
                </div>
                {step.number !== "4" && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="text-orange-500" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Events?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Join thousands of event creators using VeilTix for secure, transparent ticketing.
          </p>
          <ShimmerButton
            background="linear-gradient(135deg, rgb(251,146,60) 0%, rgb(234,88,12) 100%)"
            shimmerColor="#ffffff"
            shimmerDuration="2s"
            className="px-8 py-3 text-lg"
          >
            <Link href="/create" className="flex items-center gap-2">
              Start Creating Events
              <ArrowRight size={20} />
            </Link>
          </ShimmerButton>
        </div>
      </section>
    </div>
  )
}
