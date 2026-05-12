"use client"

import Image from "next/image"
import Link from "next/link"
import { Mail, Github, Twitter } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/veiltix-logo.png"
                alt="Veiltix Logo"
                width={36}
                height={36}
                className="rounded-md"
              />
              <h3 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                VeilTix
              </h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Blockchain-powered ticket platform for secure event management.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wide">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Create Event", href: "/create" },
                { label: "Browse Events", href: "/events" },
                { label: "Marketplace", href: "/market" },
                { label: "Check-in", href: "/check-in" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-500 hover:text-orange-500 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wide">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-gray-500 hover:text-orange-500 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wide">Follow Us</h4>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Mail, href: "mailto:contact@veiltix.com", label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2.5 bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-500 rounded-lg transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-400">
          <p>&copy; {currentYear} VeilTix. All rights reserved.</p>
          <p className="text-xs">Decentralized · Secure · Transparent</p>
        </div>
      </div>
    </footer>
  )
}
