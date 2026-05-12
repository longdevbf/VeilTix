import { Mail, Linkedin } from "lucide-react"

export const metadata = {
  title: "About Us - VeilTix",
  description: "Meet the team behind VeilTix",
}

export default function AboutPage() {
  const team = [
    { name: "Trần Đức Long", role: "Project Manager", description: "Leading the vision and strategy for VeilTix's growth and innovation.", image: "/long.png" },
    { name: "Nguyễn Văn Năng", role: "Co-founder & Lead Developer", description: "Building the technical foundation that powers secure blockchain ticketing.", image: "/nang.png" },
    { name: "Trịnh Minh Quân", role: "Co-founder & Blockchain Engineer", description: "Architecting the smart contracts and Web3 infrastructure for VeilTix.", image: "/quan.png" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200 relative overflow-hidden">
        {/* Animated blobs via CSS */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-orange-100/60 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-amber-50/80 blur-3xl animate-blob-reverse animation-delay-3000" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-orange-50/70 blur-2xl animate-scale-bounce" />

        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full mb-6 animate-fade-in">
            About Us
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-5 tracking-tight animate-fade-up">
            About{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">VeilTix</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-up animation-delay-200">
            Revolutionizing event ticketing through blockchain technology, transparency, and innovation.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="animate-fade-up animation-delay-100">
              <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">Our Mission</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Built for creators and attendees</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>VeilTix is dedicated to creating a decentralized, secure, and transparent ecosystem for event ticketing. We believe that blockchain technology should empower creators and attendees alike.</p>
                <p>By leveraging the immutability and transparency of blockchain, we eliminate fraud, reduce fees, and create a fair marketplace for everyone involved in events.</p>
                <p>Our platform is built with the vision that technology should serve people, not corporations.</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm animate-fade-up animation-delay-200">
              <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-5">Core Values</h3>
              <div className="space-y-3">
                {["Transparency at every level", "Security through blockchain", "Fairness for all users", "Innovation-driven development"].map((v, i) => (
                  <div key={v} className="flex items-center gap-3" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                    </div>
                    <span className="text-gray-700 text-sm font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">People</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Our Team</h2>
            <p className="text-gray-500 text-lg">Passionate experts dedicated to transforming event ticketing</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div
                key={member.name}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <img src={member.image} alt={member.name}
                    className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-white ring-2 ring-orange-100" />
                  {/* Pulsing ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-orange-300 animate-ping-slow opacity-40" />
                </div>
                <h3 className="text-gray-900 font-bold text-xl mb-1">{member.name}</h3>
                <p className="text-orange-500 font-semibold text-sm mb-3">{member.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{member.description}</p>
                <div className="flex justify-center gap-3">
                  <a href="#" className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-200 rounded-xl transition-colors">
                    <Linkedin size={16} />
                  </a>
                  <a href="#" className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-200 rounded-xl transition-colors">
                    <Mail size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Users", value: "1M+" },
              { label: "Events", value: "50K+" },
              { label: "Tickets Sold", value: "10M+" },
              { label: "Countries", value: "150+" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p className="text-4xl font-bold text-orange-500 mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
