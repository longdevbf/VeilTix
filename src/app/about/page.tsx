import { Mail, Linkedin } from "lucide-react"
import { image } from "motion/react-client"

export const metadata = {
  title: "About Us - VeilTix",
  description: "Meet the team behind VeilTix",
}

export default function AboutPage() {
  const team = [
    {
      name: "Trần Đức Long",
      role: "Project Manager",
      description: "Leading the vision and strategy for VeilTix's growth and innovation.",
      image: "/long.png",
    },
    {
      name: "Nguyễn Văn Năng",
      role: "Co-founder & Lead Developer",
      description: "Building the technical foundation that powers secure blockchain ticketing.",
      image: "/nang.png",
    },
    {
      name: "Trịnh Minh Quân",
      role: "Co-founder & Blockchain Engineer",
      description: "Architecting the smart contracts and Web3 infrastructure for VeilTix.",
      image: "/quan.png",
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-black pt-20">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              VeilTix
            </span>
          </h1>
          <p className="text-xl text-white/70 mb-8">
            Revolutionizing event ticketing through blockchain technology, transparency, and innovation.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-white/70 mb-4 text-lg">
                VeilTix is dedicated to creating a decentralized, secure, and transparent ecosystem for event ticketing. We believe that blockchain technology should empower creators and attendees alike.
              </p>
              <p className="text-white/70 mb-4 text-lg">
                By leveraging the immutability and transparency of blockchain, we eliminate fraud, reduce fees, and create a fair marketplace for everyone involved in events.
              </p>
              <p className="text-white/70 text-lg">
                Our platform is built with the vision that technology should serve people, not corporations. We're committed to making event ticketing truly decentralized.
              </p>
            </div>
            <div className="p-8 rounded-lg border border-orange-500/30 bg-orange-500/5">
              <div className="space-y-6">
                <div>
                  <h3 className="text-orange-400 font-bold text-sm mb-2">CORE VALUES</h3>
                  <div className="space-y-3">
                    <p className="text-white">✓ Transparency at every level</p>
                    <p className="text-white">✓ Security through blockchain</p>
                    <p className="text-white">✓ Fairness for all users</p>
                    <p className="text-white">✓ Innovation-driven development</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-black via-black to-orange-950/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Team</h2>
            <p className="text-white/60 text-lg">
              Passionate experts dedicated to transforming event ticketing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="p-8 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition"
              >
                {/* Avatar placeholder */}
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mb-6 mx-auto"
                />

                <h3 className="text-white font-bold text-xl text-center mb-2">
                  {member.name}
                </h3>
                <p className="text-orange-400 text-center font-semibold mb-4">
                  {member.role}
                </p>
                <p className="text-white/70 text-center mb-6">
                  {member.description}
                </p>

                <div className="flex justify-center gap-4">
                  <a
                    href="#"
                    className="text-white/60 hover:text-orange-400 transition"
                  >
                    <Linkedin size={20} />
                  </a>
                  <a
                    href="#"
                    className="text-white/60 hover:text-orange-400 transition"
                  >
                    <Mail size={20} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: "Users", value: "1M+" },
              { label: "Events", value: "50K+" },
              { label: "Tickets Sold", value: "10M+" },
              { label: "Countries", value: "150+" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-orange-400 mb-2">{stat.value}</p>
                <p className="text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
