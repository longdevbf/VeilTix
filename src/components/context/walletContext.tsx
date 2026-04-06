'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { WalletContextType, IUserSession } from '@/interfaces/walletContextType';
import { useRouter, usePathname } from 'next/navigation';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<IUserSession | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshUser = useCallback(async () => {
    if (!address) {
      setUser(null);
      return;
    }

    setIsRefreshing(true);
    try {
      const res = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.toLowerCase() })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Refresh User Error:', err);
      setUser(null);
    } finally {
      setIsRefreshing(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      refreshUser();
    } else {
      setUser(null);
    }
  }, [isConnected, address, refreshUser]);

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setUser(null);
    router.push('/');
  };

  const value = {
    isConnected,
    address,
    user,
    connect: handleConnect,
    disconnect: handleDisconnect,
    refreshUser,
    isLoading: isPending || isRefreshing,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

