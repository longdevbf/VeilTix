"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/components/context/walletContext"
import { useRouter } from "next/navigation"
import { Shield, LogIn, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { address, isConnected, connect, user, refreshUser } = useWallet()
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWalletStep, setShowWalletStep] = useState(false)

  // If user is already registered, redirect to home
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChecking(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      if (res.ok) {
        setShowWalletStep(true)
      } else {
        const data = await res.json()
        setError(data.error || "Email not found. Do you need to register?")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsChecking(false)
    }
  }

  // After wallet is connected and user session is established via global effect
  useEffect(() => {
    if (isConnected && user) {
        router.push("/")
    }
  }, [isConnected, user, router])

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
            <LogIn size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/60 font-medium">Identify yourself to access your tickets</p>
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

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-red-500 text-xs">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isChecking}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 mt-4 group"
            >
              {isChecking ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Find Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-white/30 px-4">
               Don't have an account? <a href="/register" className="text-orange-500 hover:underline">Register now</a>
            </p>
          </form>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                <div className="text-left">
                    <p className="text-[10px] text-white/30 font-bold uppercase">Logging in as</p>
                    <p className="text-sm font-medium text-white/80">{email}</p>
                </div>
                <button onClick={() => setShowWalletStep(false)} className="text-xs text-orange-400 font-bold hover:underline">Change</button>
            </div>

            <Shield size={64} className="mx-auto text-orange-500/50 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">Login Verification</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              Account found! Please connect the wallet linked to this email to verify your identity.
            </p>
            
            {isConnected ? (
              <div className="space-y-4">
                <div className="p-4 bg-orange-500/10 border border-orange-500 text-orange-500 rounded-2xl font-mono text-xs break-all">
                  Sign in with: {address}
                </div>
                <div className="flex items-center justify-center gap-2 text-white/40 text-xs italic">
                  <Loader2 className="animate-spin" size={12} />
                  Verifying signature...
                </div>
              </div>
            ) : (
              <button
                onClick={connect}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-extrabold transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                Connect Wallet to Proceed
              </button>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium mt-6">
                {error}
              </div>
            )}
            
            <p className="text-center text-[10px] text-white/30 mt-6 px-4 uppercase tracking-widest font-bold">
               Final Step: Cryptographic Login
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
