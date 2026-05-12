"use client"

import { useState, useEffect } from "react"
import { Mail, Copy, Check, Ticket, Calendar, ExternalLink, Edit, Save, X, Image as ImageIcon, ArrowRight, Tag, Loader2, QrCode } from "lucide-react"
import { PageBg } from "@/components/ui/page-bg"
import { TiltCard } from "@/components/ui/tilt-card"
import Link from "next/link"
import { formatEther, parseEther, parseEventLogs } from "viem"
import { useWallet } from "@/components/context/walletContext"
import { useVeilTix } from "@/hooks/use-veiltix"
import { VEILTIX_ABI } from "@/config/contract"
import QRCode from "react-qr-code"
import { useSignMessage } from "wagmi"

interface ChainTicket {
  tokenId: number
  eventId: number
  eventName: string
  eventImage: string | null
  isUsed: boolean
  listingId: number | null
  listingPrice: bigint | null
}

export default function ProfilePage() {
  const { isConnected, address } = useWallet()
  const { listTicket, cancelListing } = useVeilTix()
  const { signMessageAsync } = useSignMessage()

  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editForm, setEditForm] = useState({ username: "", description: "", image: "" })

  const [nfts, setNfts] = useState<any[]>([])
  const [loadingNfts, setLoadingNfts] = useState(false)
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [chainTickets, setChainTickets] = useState<ChainTicket[]>([])
  const [loadingChainTickets, setLoadingChainTickets] = useState(false)

  const [listModal, setListModal] = useState<{ tokenId: number; eventName: string } | null>(null)
  const [listPrice, setListPrice] = useState("")
  const [listing, setListing] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [listSuccess, setListSuccess] = useState<string | null>(null)

  const [qrModal, setQrModal] = useState<{ tokenId: number; eventName: string } | null>(null)
  const [qrValue, setQrValue] = useState<string | null>(null)
  const [qrExpiry, setQrExpiry] = useState<number>(0)
  const [signingQr, setSigningQr] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)

  const [transactionHistory, setTransactionHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true)
      fetch(`/api/profile?address=${address}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setUserInfo(data)
            setEditForm({ username: data.username || "", description: data.description || "", image: data.image || "" })
          }
        })
        .finally(() => setIsLoading(false))
    } else {
      setUserInfo(null)
      setIsLoading(false)
    }
  }, [isConnected, address])

  useEffect(() => {
    if (activeTab === "nfts" && address) {
      setLoadingNfts(true)
      fetch(`/api/nfts?address=${address}`)
        .then(res => res.json())
        .then(data => { if (data.evm_nfts) setNfts(data.evm_nfts) })
        .catch(console.error)
        .finally(() => setLoadingNfts(false))
    }
  }, [activeTab, address])

  useEffect(() => {
    if (activeTab === "tickets" && address) {
      setLoadingTickets(true)
      fetch(`/api/tickets?address=${address}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setMyTickets(data) })
        .catch(console.error)
        .finally(() => setLoadingTickets(false))
    }
  }, [activeTab, address])

  useEffect(() => {
    if (activeTab === "tickets" && address) {
      setLoadingChainTickets(true)
      fetch(`/api/tickets/token?address=${address}`)
        .then(res => res.json())
        .then((data: any[]) => {
          if (!Array.isArray(data)) return
          setChainTickets(data.map(t => ({
            tokenId: parseInt(t.token_id),
            eventId: parseInt(t.event_id),
            eventName: t.event_name || `Event #${t.event_id}`,
            eventImage: t.event_image || null,
            isUsed: t.status === "used",
            listingId: t.listing ? parseInt(t.listing.contract_listing_id) : null,
            listingPrice: t.listing ? BigInt(t.listing.price) : null,
          })))
        })
        .catch(console.error)
        .finally(() => setLoadingChainTickets(false))
    }
  }, [activeTab, address])

  useEffect(() => {
    if (activeTab === "history" && address) {
      setLoadingHistory(true)
      fetch(`/api/transactions?address=${address}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setTransactionHistory(data) })
        .catch(console.error)
        .finally(() => setLoadingHistory(false))
    }
  }, [activeTab, address])

  const handleListForSale = (tokenId: number, eventName: string) => {
    setListModal({ tokenId, eventName })
    setListPrice(""); setListError(null); setListSuccess(null)
  }

  const handleSubmitList = async () => {
    if (!listModal || !listPrice || !address) return
    const priceNum = parseFloat(listPrice)
    if (isNaN(priceNum) || priceNum <= 0) { setListError("Nhập giá hợp lệ (> 0 ROSE)"); return }
    setListing(true); setListError(null)
    try {
      const priceWei = parseEther(listPrice)
      const { hash, receipt } = await listTicket(listModal.tokenId, priceWei)
      let onChainListingId = -1
      try {
        const logs = parseEventLogs({ abi: VEILTIX_ABI as any, logs: receipt!.logs })
        const listed = logs.find((l: any) => l.eventName === "TicketListed")
        if (listed) onChainListingId = Number((listed as any).args?.listingId ?? -1)
      } catch { /* ignore */ }

      const ticket = chainTickets.find(t => t.tokenId === listModal.tokenId)
      await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractListingId: onChainListingId, tokenId: listModal.tokenId, eventId: ticket?.eventId ?? 0, sellerWallet: address, priceWei: priceWei.toString(), txHash: hash }),
      })
      setListSuccess(`Token #${listModal.tokenId} đã được list bán thành công!`)
      setListModal(null)
      setChainTickets(prev => prev.map(t => t.tokenId === listModal.tokenId ? { ...t, listingPrice: priceWei, listingId: onChainListingId } : t))
    } catch (err: any) {
      setListError(err?.shortMessage || err?.message || "List thất bại")
    } finally {
      setListing(false)
    }
  }

  const generateSignedQr = async () => {
    if (!qrModal || !address) return
    setSigningQr(true); setQrError(null); setQrValue(null)
    try {
      const expiry = Math.floor(Date.now() / 1000) + 300
      const message = `VeilTix Check-in\nToken: ${qrModal.tokenId}\nExpires: ${expiry}`
      const sig = await signMessageAsync({ message })
      const params = new URLSearchParams({ tokenId: String(qrModal.tokenId), exp: String(expiry), sig })
      setQrValue(`veiltix://checkin?${params.toString()}`)
      setQrExpiry(expiry)
    } catch (err: any) {
      setQrError(err?.shortMessage || err?.message || "Ký thất bại — hãy thử lại.")
    } finally {
      setSigningQr(false)
    }
  }

  const handleCancelListing = async (tokenId: number, listingIdVal: number) => {
    try {
      await cancelListing(listingIdVal)
      await fetch('/api/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractListingId: listingIdVal, status: 'cancelled' }),
      })
      setChainTickets(prev => prev.map(t => t.tokenId === tokenId ? { ...t, listingId: null, listingPrice: null } : t))
    } catch (err: any) {
      alert("Hủy listing thất bại: " + (err?.shortMessage || err?.message || ""))
    }
  }

  const copyAddress = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveProfile = async () => {
    if (!address) return
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, ...editForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUserInfo((prev: any) => ({ ...prev, ...data }))
      setIsEditing(false)
    } catch (e: any) {
      alert("Cập nhật thất bại: " + e.message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 flex justify-center items-start">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="animate-spin text-orange-500" size={24} />
          Loading profile...
        </div>
      </div>
    )
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
          <WalletIcon size={32} className="text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Vui lòng kết nối ví</h2>
        <p className="text-gray-500">Connect your wallet to view your profile</p>
      </div>
    )
  }

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "tickets", label: "My Tickets", icon: <Ticket size={15} /> },
    { key: "nfts", label: "My NFTs", icon: <ImageIcon size={15} /> },
    { key: "history", label: "History" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBg variant="profile" />
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden relative group flex-shrink-0 shadow-lg shadow-orange-500/20">
              {userInfo?.image ? (
                <img src={userInfo.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (userInfo?.username?.[0] || address.slice(2, 3)).toUpperCase()
              )}
              <div
                className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer transition"
                onClick={() => setIsEditing(true)}
              >
                <Edit size={20} className="text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              {!isEditing ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{userInfo?.username || "Unnamed User"}</h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="space-y-1 text-gray-500 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <span>{userInfo?.email || "No email"}</span>
                    </div>
                    <div className="text-sm italic text-gray-400">
                      {userInfo?.description || "Hello, I am a user on VeilTix!"}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3 max-w-md">
                  <input
                    type="text" value={editForm.username}
                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm transition"
                    placeholder="Username"
                  />
                  <input
                    type="text" value={editForm.image}
                    onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm transition"
                    placeholder="Image URL"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm transition resize-none"
                    placeholder="Description / Bio"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveProfile}
                      className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
                      <Save size={14} /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wallet Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 w-full md:w-72 flex-shrink-0">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Connected Wallet</p>
              <div className="flex items-start justify-between gap-2 mb-3">
                <code className="text-orange-500 font-mono text-xs break-all leading-relaxed">{address}</code>
                <button onClick={copyAddress} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0" title="Copy">
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                </button>
              </div>
              <a
                href={`https://testnet.explorer.sapphire.oasis.dev/address/${address}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 transition-colors text-xs font-medium"
              >
                View on Oasis Explorer <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-orange-500 border-orange-500"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome back, {userInfo?.username || "Guest"} 👋
            </h2>
            <p className="text-gray-500 leading-relaxed">
              This is your profile overview. You can edit your profile details, view your tickets and NFT collections.
            </p>
          </div>
        )}

        {/* My Tickets */}
        {activeTab === "tickets" && (
          <div className="space-y-10">
            {/* On-chain NFT Tickets */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">On-chain Tickets (NFT)</h2>
                {loadingChainTickets && (
                  <span className="flex items-center gap-2 text-gray-400 text-sm">
                    <Loader2 size={14} className="animate-spin text-orange-500" /> Đang đồng bộ...
                  </span>
                )}
              </div>

              {listSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                  {listSuccess}
                </div>
              )}

              {!loadingChainTickets && chainTickets.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Ticket size={22} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm">Không tìm thấy NFT vé nào trong ví của bạn.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chainTickets.map(ct => {
                    const imgUrl = ct.eventImage
                      ? ct.eventImage.startsWith("http") ? ct.eventImage : `https://ipfs.io/ipfs/${ct.eventImage}`
                      : null
                    return (
                      <div key={ct.tokenId} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:shadow-sm hover:border-gray-300 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                            {imgUrl ? (
                              <img src={imgUrl} alt={ct.eventName} className="w-full h-full object-cover" />
                            ) : (
                              <Ticket size={20} className="text-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className="text-gray-900 font-semibold text-sm">{ct.eventName}</p>
                            <p className="text-gray-400 text-xs mt-0.5">Token #{ct.tokenId}</p>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {ct.isUsed && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Đã sử dụng</span>
                              )}
                              {ct.listingPrice && (
                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                                  Đang bán: {parseFloat(formatEther(ct.listingPrice)).toFixed(4)} ROSE
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!ct.isUsed && ct.listingId === null && (
                            <button
                              onClick={() => handleListForSale(ct.tokenId, ct.eventName)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-500 text-xs rounded-lg hover:bg-orange-100 transition-colors font-semibold"
                            >
                              <Tag size={12} /> Bán vé
                            </button>
                          )}
                          {ct.listingId !== null && ct.listingId >= 0 && (
                            <button
                              onClick={() => handleCancelListing(ct.tokenId, ct.listingId!)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 text-xs rounded-lg hover:bg-red-100 transition-colors font-semibold"
                            >
                              <X size={12} /> Hủy bán
                            </button>
                          )}
                          {!ct.isUsed && (
                            <button
                              onClick={() => setQrModal({ tokenId: ct.tokenId, eventName: ct.eventName })}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <QrCode size={12} /> Show QR
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Purchase history */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-5">Lịch sử mua vé</h2>
              {loadingTickets ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="animate-spin text-orange-500" size={18} /> Đang tải...
                </div>
              ) : myTickets.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Ticket size={22} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm mb-3">Bạn chưa có lịch sử mua vé.</p>
                  <Link href="/events" className="text-orange-500 hover:underline text-sm font-medium">
                    Khám phá sự kiện →
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myTickets.map((ticket: any, idx: number) => {
                    const eventImage = ticket.event_image && !ticket.event_image.startsWith("http")
                      ? `https://ipfs.io/ipfs/${ticket.event_image}` : ticket.event_image
                    const eventDate = ticket.event_date
                      ? new Date(ticket.event_date).toLocaleString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "—"
                    return (
                      <TiltCard key={ticket.order_id} intensity={10}>
                      <div
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-full"
                        style={{ boxShadow: "0 4px 20px -6px rgba(0,0,0,0.07)" }}>
                        <div className="w-full h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                          {eventImage ? (
                            <img src={eventImage} alt={ticket.event_title} className="w-full h-full object-cover" />
                          ) : (
                            <Ticket size={32} className="text-gray-300" />
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="font-bold text-gray-900 truncate">{ticket.event_title}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar size={12} />
                            <span>{eventDate}</span>
                          </div>
                          {ticket.event_location && (
                            <p className="text-xs text-gray-400 truncate">{ticket.event_location}</p>
                          )}
                          {ticket.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-500">
                              <span>{item.tier} × {item.quantity}</span>
                              <span className="text-orange-500 font-medium">{parseFloat(item.unit_price).toFixed(4)} ROSE</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ticket.payment_status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {ticket.payment_status}
                            </span>
                            {ticket.tx_hash && (
                              <a href={`https://testnet.explorer.sapphire.oasis.dev/tx/${ticket.tx_hash}`} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
                                Tx <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                          <Link href={`/events/${ticket.event_id}`}
                            className="inline-flex items-center justify-center gap-1.5 w-full mt-1 text-xs bg-orange-50 text-orange-500 px-3 py-2 rounded-xl hover:bg-orange-100 transition-colors font-medium">
                            Xem sự kiện <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                      </TiltCard>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* List for Sale Modal */}
        {listModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Bán vé trên Marketplace</h3>
                <button onClick={() => setListModal(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-0.5">Sự kiện: <span className="text-gray-900 font-semibold">{listModal.eventName}</span></p>
              <p className="text-gray-400 text-xs mb-5">Token #{listModal.tokenId}</p>

              <label className="block text-sm font-semibold text-gray-700 mb-2">Giá bán (ROSE)</label>
              <input
                type="number" min="0" step="0.001" value={listPrice}
                onChange={e => setListPrice(e.target.value)} placeholder="Ví dụ: 0.5"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition mb-2"
              />
              <p className="text-gray-400 text-xs mb-5">
                Người mua trả {listPrice || "0"} ROSE. Bạn nhận ~92.5% (sau 5% royalty + 2.5% platform fee).
              </p>
              {listError && <p className="text-red-500 text-sm mb-4">{listError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitList} disabled={listing || !listPrice}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {listing ? <><Loader2 size={16} className="animate-spin" /> Đang list...</> : <><Tag size={16} /> Xác nhận bán</>}
                </button>
                <button onClick={() => setListModal(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My NFTs */}
        {activeTab === "nfts" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">My NFTs on Nexus Explorer</h2>
            {loadingNfts ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="animate-spin text-orange-500" size={18} /> Đang tải NFT...
              </div>
            ) : nfts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ImageIcon size={22} className="text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">Không tìm thấy token NFT nào trên Sapphire Testnet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">
                {nfts.map((nft: any, i: number) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all shadow-sm">
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {nft.image ? (
                        <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={36} className="text-gray-300" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate text-sm">{nft.name || "Unnamed NFT"}</h3>
                      <p className="text-xs text-orange-500/80 mb-1 truncate">{nft.token?.name} · #{nft.id}</p>
                      <p className="text-xs text-gray-400 truncate">{nft.token?.eth_contract_addr}</p>
                      {nft.description && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{nft.description}</p>
                      )}
                      <a
                        href={`https://nexus.oasis.io/sapphire/address/${nft.token?.eth_contract_addr}/token-transfers`}
                        target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center justify-center w-full text-xs bg-orange-50 text-orange-500 px-3 py-2 rounded-xl hover:bg-orange-100 transition-colors font-medium"
                      >
                        View on Nexus
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transaction History */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Transaction History</h2>
            {loadingHistory ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="animate-spin text-orange-500" size={18} /> Đang tải lịch sử...
              </div>
            ) : transactionHistory.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
                <p className="text-gray-500 text-sm">Không có lịch sử giao dịch.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactionHistory.map((tx: any) => (
                  <div key={tx.id}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-sm hover:border-gray-300 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Ticket size={16} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {tx.type === "BUY_TICKET" ? "Mua vé" : tx.type}
                        </p>
                        {tx.event_title && <p className="text-xs text-gray-400 mt-0.5">{tx.event_title}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(tx.created_at).toLocaleString("vi-VN")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      {tx.amount && (
                        <span className="text-orange-500 font-bold text-sm">{parseFloat(tx.amount).toFixed(4)} ROSE</span>
                      )}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${tx.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {tx.status}
                      </span>
                      {tx.tx_hash && (
                        <a href={`https://testnet.explorer.sapphire.oasis.dev/tx/${tx.tx_hash}`} target="_blank" rel="noopener noreferrer"
                          className="text-gray-400 hover:text-orange-500 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-gray-900 font-bold text-lg">Vé của bạn</h3>
                <p className="text-gray-500 text-sm mt-0.5">{qrModal.eventName}</p>
                <p className="text-orange-500 text-xs mt-0.5">Token #{qrModal.tokenId}</p>
              </div>
              <button
                onClick={() => { setQrModal(null); setQrValue(null); setQrError(null) }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="text-gray-500" size={18} />
              </button>
            </div>

            {signingQr ? (
              <div className="aspect-square flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl mb-5 gap-3">
                <Loader2 size={28} className="animate-spin text-orange-500" />
                <p className="text-gray-500 text-sm">Đang ký với ví của bạn...</p>
              </div>
            ) : qrError ? (
              <div className="aspect-square flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-xl mb-5 gap-3 p-6 text-center">
                <X className="text-red-400" size={28} />
                <p className="text-red-500 text-sm">{qrError}</p>
                <button onClick={generateSignedQr}
                  className="px-4 py-2 bg-orange-50 text-orange-500 rounded-xl text-sm hover:bg-orange-100 transition-colors font-medium">
                  Thử lại
                </button>
              </div>
            ) : qrValue ? (
              <>
                <div className="bg-white p-4 rounded-xl flex items-center justify-center mb-3 border border-gray-200">
                  <QRCode value={qrValue} size={200} bgColor="#ffffff" fgColor="#000000" />
                </div>
                <QrCountdown expiry={qrExpiry} onExpired={generateSignedQr} />
              </>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl mb-5 gap-3">
                <QrCode size={40} className="text-gray-300" />
                <p className="text-gray-400 text-sm text-center px-4">
                  Nhấn bên dưới để tạo QR có chữ ký ví
                </p>
              </div>
            )}

            <p className="text-gray-400 text-xs text-center mb-4">
              QR có chữ ký ví · hết hạn sau 5 phút · chỉ bạn mới tạo được
            </p>

            {!qrValue && !signingQr && (
              <button
                onClick={generateSignedQr}
                className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-semibold"
              >
                Tạo QR Check-in
              </button>
            )}

            <button
              onClick={() => { setQrModal(null); setQrValue(null); setQrError(null) }}
              className="mt-2 w-full py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function QrCountdown({ expiry, onExpired }: { expiry: number; onExpired: () => void }) {
  const [remaining, setRemaining] = useState(() => expiry - Math.floor(Date.now() / 1000))
  useEffect(() => {
    const id = setInterval(() => {
      const left = expiry - Math.floor(Date.now() / 1000)
      setRemaining(left)
      if (left <= 0) { clearInterval(id); onExpired() }
    }, 1000)
    return () => clearInterval(id)
  }, [expiry, onExpired])

  const mins = Math.floor(Math.max(remaining, 0) / 60)
  const secs = Math.max(remaining, 0) % 60
  const pct = Math.max((remaining / 300) * 100, 0)

  return (
    <div className="mb-4">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${remaining < 60 ? "bg-red-500" : "bg-orange-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs text-center mt-1.5 ${remaining < 60 ? "text-red-500" : "text-gray-400"}`}>
        QR hết hạn sau {mins}:{String(secs).padStart(2, "0")}
      </p>
    </div>
  )
}

function WalletIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  )
}
