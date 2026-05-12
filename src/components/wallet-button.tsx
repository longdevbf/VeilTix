"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, User, LogOut, CheckSquare } from "lucide-react"
import { useWallet } from "./context/walletContext"
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletButton() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { isConnected, address, disconnect } = useWallet()
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    if (isConnected && address) {
      fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUserInfo(data.user)
      })
      .catch(console.error)
    } else {
      setUserInfo(null)
    }
  }, [isConnected, address])

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition-colors shadow-sm shadow-orange-500/20"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-5 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Wrong network
                  </button>
                );
              }

              const displayName = userInfo?.username || (address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Connected');

              return (
                <div className="flex items-center gap-2">
                  {/* Chain button */}
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    {chain.hasIcon && (
                      <div style={{ background: chain.iconBackground, width: 18, height: 18, borderRadius: 999, overflow: 'hidden' }}>
                        {chain.iconUrl && (
                          <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} style={{ width: 18, height: 18 }} />
                        )}
                      </div>
                    )}
                    <span className="hidden lg:inline">{chain.name}</span>
                  </button>

                  {/* Account button */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 text-orange-600 text-sm font-medium rounded-xl hover:bg-orange-100 transition-colors"
                    >
                      {userInfo?.image ? (
                        <img src={userInfo.image} alt="Avatar" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(userInfo?.username?.[0] || address?.slice(2,3) || '0').toUpperCase()}
                        </div>
                      )}
                      <span className="whitespace-nowrap max-w-28 truncate">{displayName}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Account</p>
                            <p className="text-sm text-gray-700 font-semibold truncate mt-0.5">{displayName}</p>
                          </div>

                          <div className="py-1">
                            <Link
                              href="/profile"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <User size={16} className="text-gray-400" />
                              Profile
                            </Link>
                            <Link
                              href="/check-in"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <CheckSquare size={16} className="text-gray-400" />
                              Check-in
                            </Link>
                          </div>

                          <div className="border-t border-gray-100 p-2">
                            <button
                              onClick={() => { disconnect(); setDropdownOpen(false); }}
                              className="w-full flex items-center gap-2 justify-center px-3 py-2 text-sm text-red-500 font-medium bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <LogOut size={14} />
                              Disconnect
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  )
}
