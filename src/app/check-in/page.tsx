"use client"

import { QrCode, CheckCircle, X, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"

export default function CheckInPage() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle')
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      setIsMobile(mobileRegex.test(navigator.userAgent) || window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Clear scanner on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => { })
          .finally(() => {
            scannerRef.current?.clear().catch(() => { })
            scannerRef.current = null
          })
      }
    }
  }, [])

  const startScanning = () => {
    if (!isMobile) {
      return
    }
    setScanResult(null)
    setValidationStatus('idle')
    setIsScanning(true)
  }

  useEffect(() => {
    if (isScanning && isMobile && !scannerRef.current) {
      const html5QrCode = new Html5Qrcode("qr-reader")
      scannerRef.current = html5QrCode

      html5QrCode
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            setScanResult(decodedText)
            setIsScanning(false)
            setValidationStatus('validating')
            html5QrCode
              .stop()
              .catch(() => { })
              .finally(() => {
                html5QrCode.clear().catch(() => { })
                scannerRef.current = null
              })

            setTimeout(() => {
              if (Math.random() > 0.3) {
                setValidationStatus('success')
              } else {
                setValidationStatus('error')
              }
            }, 1500)
          },
          (errorMessage) => {
            // Uncomment to see continuous scanning errors
            // console.log("QR scan error:", errorMessage)
          }
        )
        .catch((err) => {
          console.error("Unable to start QR scanner", err)
          setIsScanning(false)
          scannerRef.current = null
        })
    }
  }, [isScanning, isMobile])

  const stopScanning = () => {
    setIsScanning(false)
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .catch(() => { })
        .finally(() => {
          scannerRef.current?.clear().catch(() => { })
          scannerRef.current = null
        })
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black pt-20">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(218px); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Smart Check-in System
          </h1>
          <p className="text-xl text-white/70 mb-12">
            Verify attendees instantly using blockchain-verified NFT tickets
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* QR Code Scanner Main Card with Animated Border */}
            <div className="relative p-[2px] rounded-2xl overflow-hidden group">
              {/* Spinning Conic Gradient */}
              <div className="absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_70%,#f97316_100%)] animate-[spin_4s_linear_infinite]" />

              {/* Main Content Pane */}
              <div className="relative h-full rounded-2xl bg-[#0a0a0a] p-8 z-10 flex flex-col">
                <div className="aspect-square bg-black rounded-xl flex items-center justify-center mb-6 border border-orange-500/20 relative overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.05)]">
                  {isScanning ? (
                    <div className="w-full h-full relative">
                      <div id="qr-reader" className="w-full h-full"></div>

                      {/* Scan line effect */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] pointer-events-none z-10 overflow-hidden">
                        <div
                          className="w-full h-[3px] bg-orange-500 shadow-[0_0_20px_6px_rgba(249,115,22,0.8)] border-b border-orange-200"
                          style={{ animation: 'scan 2.5s ease-in-out infinite' }}
                        ></div>
                        {/* Scanner overlay brackets */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-500"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-500"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500"></div>
                      </div>

                      <button
                        onClick={stopScanning}
                        className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500/30 rounded-full p-2 transition-colors z-20"
                        title="Stop scanning"
                      >
                        <X className="text-red-400" size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center cursor-pointer group-hover:scale-105 transition-transform duration-500" onClick={startScanning}>
                      <div className="relative">
                        <QrCode className="text-orange-400 mx-auto mb-4 relative z-10" size={64} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-orange-500/20 blur-xl rounded-full"></div>
                      </div>
                      <p className="text-white/80 font-medium">QR Code Scanner</p>
                      <p className="text-orange-400/80 text-sm mt-2 animate-pulse">Tap to start scanning</p>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Instant Verification
                </h3>
                <p className="text-white/60 mb-auto">
                  Scan NFT tickets to instantly verify attendees and prevent fraud.
                </p>
                {validationStatus === 'validating' && (
                  <div className="mt-4 p-6 border border-orange-500/20 rounded-lg bg-orange-500/10 flex flex-col items-center justify-center space-y-3 relative overflow-hidden backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                    <Loader2 className="animate-spin text-orange-400" size={32} />
                    <p className="text-orange-400 font-medium">Đang xác thực Blockchain...</p>
                    <p className="text-white/50 text-xs">Vui lòng đợi trong giây lát</p>
                  </div>
                )}

                {validationStatus === 'success' && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="text-green-400 animate-bounce" size={24} />
                      <p className="text-green-400 font-bold">Check-in thành công!</p>
                    </div>
                    <p className="text-green-400/80 text-sm mb-3">Vé Blockchain hợp lệ.</p>
                    <p className="text-white/60 text-xs mb-4 break-all bg-black/80 p-3 rounded border border-white/5 font-mono shadow-inner">
                      {scanResult}
                    </p>
                    <button
                      onClick={startScanning}
                      className="w-full py-3 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-lg font-bold transition-all shadow-lg shadow-green-500/20"
                    >
                      Quét vé tiếp theo
                    </button>
                  </div>
                )}

                {validationStatus === 'error' && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="text-red-400 animate-pulse" size={24} />
                      <p className="text-red-400 font-bold">Vé không hợp lệ!</p>
                    </div>
                    <p className="text-red-400/80 text-sm mb-4">Vé này đã được sử dụng hoặc không tồn tại trên hệ thống sự kiện.</p>
                    <button
                      onClick={startScanning}
                      className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-lg font-bold transition-all shadow-lg shadow-orange-500/20"
                    >
                      Thử quét lại
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Features Info */}
            <div className="space-y-4 flex flex-col justify-center">
              {[
                {
                  title: "Real-time Validation",
                  description: "Verify tickets instantly on the blockchain",
                },
                {
                  title: "Fraud Prevention",
                  description: "Detect duplicate and forged tickets automatically",
                },
                {
                  title: "Analytics Dashboard",
                  description: "Track attendance and gather event insights",
                },
                {
                  title: "Offline Support",
                  description: "Check-in works even without internet connection",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="relative p-[1px] rounded-xl overflow-hidden group cursor-default"
                >
                  {/* Hover Animated Border for feature cards */}
                  <div className="absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_70%,#f97316_100%)] opacity-0 group-hover:opacity-100 group-hover:animate-[spin_2s_linear_infinite] transition-opacity duration-300" />

                  <div className="relative p-5 rounded-xl bg-[#0a0a0a] group-hover:bg-[#0f0f0f] transition-colors duration-300 z-10 h-full">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 bg-orange-500/10 rounded-full p-2 border border-orange-500/20 group-hover:border-orange-500/50 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all">
                        <CheckCircle
                          className="text-orange-400 flex-shrink-0"
                          size={20}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-orange-100 transition-colors">{feature.title}</h4>
                        <p className="text-white/50 text-sm mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-500/5 border border-orange-500/30 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Check-in Tools Coming Soon
            </h3>
            <p className="text-white/70">
              Advanced check-in features for event organizers are currently in development.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
