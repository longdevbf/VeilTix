"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/components/context/walletContext"
import { useRouter } from "next/navigation"
import { Shield, User, Mail, ArrowRight, Loader2, Users, Calendar } from "lucide-react"

export default function RegisterPage() {
  const { address, isConnected, connect, user, refreshUser } = useWallet()
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"organizer" | "customer">("customer")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWalletStep, setShowWalletStep] = useState(false)

  // If user is already registered, redirect to home
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setShowWalletStep(true)
  }

  const handleFinalSubmit = async () => {
    if (!address) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          address: address.toLowerCase()
        })
      })

      const data = await res.json()
      if (res.ok) {
        await refreshUser()
        router.push("/")
      } else {
        setError(data.error || "Failed to register")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 pt-20 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
         <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-orange-500 rounded-full blur-[120px]" />
         <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full relative">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-orange-500/10 text-orange-500 mb-6 border border-orange-500/20">
            <User size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/60 font-medium">Join VeilTix and start your journey</p>
        </div>

        {!showWalletStep ? (
          <form onSubmit={handleInitialSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl space-y-6">
            <div>
              <label className="block text-sm font-bold text-white/50 mb-3 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:border-orange-500/50 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white/50 mb-4 ml-1 uppercase tracking-wider">I want to...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`p-4 rounded-2xl border transition-all text-center ${
                    role === "customer"
                      ? "bg-orange-500/10 border-orange-500 text-orange-500"
                      : "bg-black/20 border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  <Users size={20} className="mx-auto mb-2" />
                  <span className="font-bold">Buy Tickets</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("organizer")}
                  className={`p-4 rounded-2xl border transition-all text-center ${
                    role === "organizer"
                      ? "bg-orange-500/10 border-orange-500 text-orange-500"
                      : "bg-black/20 border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  <Calendar size={20} className="mx-auto mb-2" />
                  <span className="font-bold">Host Events</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 mt-4 group"
            >
              Continue to Wallet
              <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
            </button>
            <p className="text-center text-xs text-white/30 px-4">
               Step 1 of 2: Identity Identification
            </p>
          </form>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                <div className="text-left">
                    <p className="text-[10px] text-white/30 font-bold uppercase">Account Link</p>
                    <p className="text-sm font-medium text-white/80">{email}</p>
                </div>
                <button onClick={() => setShowWalletStep(false)} className="text-xs text-orange-400 font-bold hover:underline">Change</button>
            </div>

            <Shield size={64} className="mx-auto text-orange-500/50 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">Link Your Wallet</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              To complete registration, connect your wallet to use as your secure cryptographic identity.
            </p>
            
            {isConnected ? (
              <div className="space-y-4">
                <div className="p-4 bg-orange-500/10 border border-orange-500 text-orange-500 rounded-2xl font-mono text-xs break-all">
                  Connected: {address}
                </div>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl font-extrabold transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-extrabold transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                Connect Wallet
              </button>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium mt-6">
                {error}
              </div>
            )}
            
            <p className="text-center text-[10px] text-white/30 mt-6 px-4">
               Final Step: Cryptographic Verification
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
