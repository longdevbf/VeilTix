import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import './globals.css'
import { Providers } from "@/components/provider/provider"
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'VeilTix - Blockchain Ticket Platform',
  description: 'Secure and decentralized event ticketing powered by blockchain technology',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/veiltix-logo.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50">
        <Providers>
        <Header />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
        <Analytics />
        </Providers>
      </body>
    </html>
  )
}
