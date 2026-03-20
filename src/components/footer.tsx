"use client"

import Image from "next/image"
import Link from "next/link"
import { Mail, Github, Twitter } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black/80 border-t border-orange-500/20 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/veiltix-logo.png"
                alt="Veiltix Logo"
                width={70}
                height={70}
                className="rounded-sm"
              />
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Veiltix
              </h3>
            </div>
            <p className="text-white/60 text-sm">
              Blockchain-powered ticket platform for secure event management.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/create" className="text-white/60 hover:text-orange-400 transition">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white/60 hover:text-orange-400 transition">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/market" className="text-white/60 hover:text-orange-400 transition">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/check-in" className="text-white/60 hover:text-orange-400 transition">
                  Check-in
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-white/60 hover:text-orange-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-orange-400 transition">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-orange-400 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-orange-400 transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-white/60 hover:text-orange-400 transition"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-orange-400 transition"
              >
                <Github size={20} />
              </a>
              <a
                href="mailto:contact@VeilTix.com"
                className="text-white/60 hover:text-orange-400 transition"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-orange-500/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/60">
          <p>&copy; {currentYear} VeilTix. All rights reserved.</p>
          <p>Decentralized. Secure. Transparent.</p>
        </div>
      </div>
    </footer>
  )
}
