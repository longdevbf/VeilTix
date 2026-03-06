import { TrendingUp, BarChart3, Zap } from "lucide-react"

export const metadata = {
  title: "Marketplace - VeilTix",
  description: "Buy and sell tickets on the decentralized marketplace",
}

export default function MarketPage() {
  const listings = [
    {
      event: "Web3 Conference 2024",
      seller: "Alice#1234",
      price: "0.6 ETH",
      floor: "0.5 ETH",
      premium: "+20%",
    },
    {
      event: "Crypto Music Festival",
      seller: "Bob#5678",
      price: "0.3 ETH",
      floor: "0.25 ETH",
      premium: "+20%",
    },
    {
      event: "NFT Art Exhibition",
      seller: "Charlie#9012",
      price: "0.12 ETH",
      floor: "0.1 ETH",
      premium: "+20%",
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-black pt-20">
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ticket Marketplace
          </h1>
          <p className="text-xl text-white/70 mb-12">
            Buy and sell verified tickets with creator royalties
          </p>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: TrendingUp,
                label: "Active Listings",
                value: "2,543",
              },
              {
                icon: BarChart3,
                label: "Total Volume",
                value: "1,250 ETH",
              },
              {
                icon: Zap,
                label: "Avg. Premium",
                value: "18%",
              },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div
                  key={idx}
                  className="border border-orange-500/30 rounded-lg bg-orange-500/5 p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="text-orange-400" size={24} />
                    <p className="text-white/60">{stat.label}</p>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Listings */}
          <div className="bg-orange-500/5 border border-orange-500/30 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-orange-500/20">
              <h2 className="text-xl font-bold text-white">Recent Listings</h2>
            </div>

            <div className="divide-y divide-orange-500/20">
              {listings.map((listing, idx) => (
                <div key={idx} className="p-6 hover:bg-orange-500/5 transition">
                  <div className="grid md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-white font-semibold">
                        {listing.event}
                      </p>
                      <p className="text-white/60 text-sm">by {listing.seller}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Price</p>
                      <p className="text-white font-bold">{listing.price}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Floor Price</p>
                      <p className="text-white font-bold">{listing.floor}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Premium</p>
                      <p className="text-orange-400 font-bold">
                        {listing.premium}
                      </p>
                    </div>
                    <div className="text-right">
                      <button className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition font-semibold">
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                title: "Fair Pricing",
                description: "Transparent price discovery through open marketplace",
              },
              {
                title: "Creator Royalties",
                description: "Event creators earn royalties on secondary sales",
              },
              {
                title: "Instant Settlement",
                description: "Trades settle instantly on the blockchain",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="border border-orange-500/30 rounded-lg bg-orange-500/5 p-6"
              >
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
