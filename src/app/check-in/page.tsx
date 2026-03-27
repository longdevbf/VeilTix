"use client"

import { QrCode, CheckCircle, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"

export default function CheckInPage() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
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
            html5QrCode
              .stop()
              .catch(() => { })
              .finally(() => {
                html5QrCode.clear().catch(() => { })
                scannerRef.current = null
              })
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
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(218px); }
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
            {/* QR Code Scanner */}
            <div className="border border-orange-500/30 rounded-lg bg-orange-500/5 p-8">
              <div className="aspect-square bg-black rounded-lg flex items-center justify-center mb-6 border border-orange-500/30 relative overflow-hidden">
                {isScanning ? (
                  <div className="w-full h-full relative">
                    <div id="qr-reader" className="w-full h-full"></div>
                    
                    {/* Scan line effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] pointer-events-none z-10 overflow-hidden">
                      <div 
                        className="w-full h-[2px] bg-orange-500 shadow-[0_0_15px_4px_rgba(249,115,22,0.8)] border-b border-orange-200" 
                        style={{ animation: 'scan 2.5s ease-in-out infinite' }}
                      ></div>
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
                  <div className="text-center cursor-pointer" onClick={startScanning}>
                    <QrCode className="text-orange-400 mx-auto mb-4" size={64} />
                    <p className="text-white/60">QR Code Scanner</p>
                    <p className="text-orange-400 text-sm mt-2">Tap to start scanning</p>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Instant Verification
              </h3>
              <p className="text-white/70">
                Scan NFT tickets to instantly verify attendees and prevent fraud.
              </p>
              {scanResult && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded">
                  <p className="text-green-400 text-sm font-medium">✓ Scanned successfully</p>
                  <p className="text-green-400 text-xs mt-1 break-all">{scanResult}</p>
                  <button
                    onClick={startScanning}
                    className="mt-2 text-orange-400 text-xs hover:text-orange-300 underline"
                  >
                    Scan another code
                  </button>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4">
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
                  className="p-4 border border-orange-500/30 rounded-lg bg-orange-500/5"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      className="text-orange-400 flex-shrink-0 mt-1"
                      size={20}
                    />
                    <div>
                      <h4 className="font-bold text-white">{feature.title}</h4>
                      <p className="text-white/60 text-sm">
                        {feature.description}
                      </p>
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
