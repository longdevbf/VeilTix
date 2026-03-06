import { Mail, MessageSquare, Phone } from "lucide-react"

export const metadata = {
  title: "Contact Us - VeilTix",
  description: "Get in touch with the VeilTix team",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black pt-20">
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-white/70 mb-12">
            Have questions? We'd love to hear from you.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-orange-500/5 border border-orange-500/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full bg-black/50 border border-orange-500/30 rounded px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-orange-500/60"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full bg-black/50 border border-orange-500/30 rounded px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-orange-500/60"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    className="w-full bg-black/50 border border-orange-500/30 rounded px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-orange-500/60"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    placeholder="Your message..."
                    rows={5}
                    className="w-full bg-black/50 border border-orange-500/30 rounded px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-orange-500/60 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg hover:from-orange-500 hover:to-orange-700 transition font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="border border-orange-500/30 rounded-lg bg-orange-500/5 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Mail className="text-orange-400 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="text-white font-bold mb-2">Email</h3>
                    <a
                      href="mailto:contact@VeilTix.com"
                      className="text-white/70 hover:text-orange-400 transition"
                    >
                      contact@VeilTix.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="border border-orange-500/30 rounded-lg bg-orange-500/5 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <MessageSquare
                    className="text-orange-400 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <div>
                    <h3 className="text-white font-bold mb-2">Discord Community</h3>
                    <p className="text-white/70 mb-2">
                      Join our Discord for support and updates
                    </p>
                    <a
                      href="#"
                      className="text-orange-400 hover:text-orange-300 transition font-semibold"
                    >
                      Join Discord →
                    </a>
                  </div>
                </div>
              </div>

              <div className="border border-orange-500/30 rounded-lg bg-orange-500/5 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Phone
                    className="text-orange-400 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <div>
                    <h3 className="text-white font-bold mb-2">Response Time</h3>
                    <p className="text-white/70">
                      Typically respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-orange-500/30 rounded-lg bg-orange-500/5 p-6">
                <h3 className="text-white font-bold mb-4">Business Hours</h3>
                <p className="text-white/70 text-sm">
                  Monday - Friday: 9:00 AM - 6:00 PM UTC
                </p>
                <p className="text-white/70 text-sm mt-2">
                  Weekend: Support available 24/7 on Discord
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: "How do I get started?",
                  a: "Connect your wallet and create your first event in just a few minutes.",
                },
                {
                  q: "What fees does VeilTix charge?",
                  a: "We charge industry-leading low fees. Check our pricing page for details.",
                },
                {
                  q: "Are my tickets secure?",
                  a: "Yes! All tickets are secured by blockchain technology with immutable records.",
                },
                {
                  q: "What chains do you support?",
                  a: "We support Ethereum, Polygon, and other major blockchain networks.",
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-orange-500/30 rounded-lg bg-orange-500/5 p-6"
                >
                  <h4 className="text-white font-bold mb-2">{faq.q}</h4>
                  <p className="text-white/70 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
