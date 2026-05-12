import { Mail, MessageSquare, Phone, Clock } from "lucide-react"

export const metadata = {
  title: "Contact Us - VeilTix",
  description: "Get in touch with the VeilTix team",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">Get in Touch</h1>
          <p className="text-gray-500 text-lg">Have questions? We&apos;d love to hear from you.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form className="space-y-4">
              {[
                { label: "Name", type: "text", placeholder: "Your name" },
                { label: "Email", type: "email", placeholder: "your@email.com" },
                { label: "Subject", type: "text", placeholder: "How can we help?" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                <textarea
                  placeholder="Your message..."
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition resize-none text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition-colors shadow-sm shadow-orange-500/20"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            {[
              {
                icon: Mail,
                title: "Email",
                content: <a href="mailto:contact@veiltix.com" className="text-orange-500 hover:underline font-medium text-sm">contact@veiltix.com</a>,
                color: "bg-blue-50 text-blue-500",
              },
              {
                icon: MessageSquare,
                title: "Discord Community",
                content: (
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Join our Discord for support and updates</p>
                    <a href="#" className="text-orange-500 hover:underline font-semibold text-sm">Join Discord →</a>
                  </div>
                ),
                color: "bg-purple-50 text-purple-500",
              },
              {
                icon: Phone,
                title: "Response Time",
                content: <p className="text-gray-500 text-sm">Typically respond within 24 hours</p>,
                color: "bg-green-50 text-green-500",
              },
              {
                icon: Clock,
                title: "Business Hours",
                content: (
                  <div className="text-gray-500 text-sm space-y-1">
                    <p>Mon–Fri: 9:00 AM – 6:00 PM UTC</p>
                    <p>Weekend: Support via Discord</p>
                  </div>
                ),
                color: "bg-orange-50 text-orange-500",
              },
            ].map(({ icon: Icon, title, content, color }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-sm mb-1.5">{title}</h3>
                  {content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-7 tracking-tight">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: "How do I get started?", a: "Connect your wallet and create your first event in just a few minutes." },
              { q: "What fees does VeilTix charge?", a: "We charge industry-leading low fees. Check our pricing page for details." },
              { q: "Are my tickets secure?", a: "Yes! All tickets are secured by blockchain technology with immutable records." },
              { q: "What chains do you support?", a: "We support Oasis Sapphire and other major blockchain networks." },
            ].map((faq) => (
              <div key={faq.q} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h4 className="text-gray-900 font-bold text-sm mb-2">{faq.q}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
