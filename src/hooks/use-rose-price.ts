"use client"

import { useState, useEffect } from "react"

interface RosePrice {
  usd: number | null
  change24h: number | null
  loading: boolean
  error: boolean
}

export function useRosePrice(): RosePrice {
  const [usd, setUsd] = useState<number | null>(null)
  const [change24h, setChange24h] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true

    const fetch_ = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=oasis-network&vs_currencies=usd&include_24hr_change=true",
          { next: { revalidate: 60 } }
        )
        if (!res.ok) throw new Error("fetch failed")
        const data = await res.json()
        if (!mounted) return
        setUsd(data["oasis-network"]?.usd ?? null)
        setChange24h(data["oasis-network"]?.usd_24h_change ?? null)
        setError(false)
      } catch {
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetch_()
    const id = setInterval(fetch_, 60_000) // refresh every 60 s
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return { usd, change24h, loading, error }
}
