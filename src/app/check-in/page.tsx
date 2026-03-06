import { QrCode, CheckCircle } from "lucide-react"

export const metadata = {
  title: "Check-in - VeilTix",
  description: "Verify and check-in attendees using blockchain",
}

export default function CheckInPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black pt-20">
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
              <div className="aspect-square bg-black rounded-lg flex items-center justify-center mb-6 border border-orange-500/30">
                <div className="text-center">
                  <QrCode className="text-orange-400 mx-auto mb-4" size={64} />
                  <p className="text-white/60">QR Code Scanner</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Instant Verification
              </h3>
              <p className="text-white/70">
                Scan NFT tickets to instantly verify attendees and prevent fraud.
              </p>
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
