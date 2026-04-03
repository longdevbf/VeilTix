'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import {WalletContextType} from '@/interfaces/walletContextType';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected} = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected && address) {
      fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error('API Error:', data.error);
          } else {
            console.log('User saved to DB:', data.user);
          }
        })
        .catch((err) => console.error('Failed to save user to DB:', err));
    }
  }, [isConnected, address]);

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const value = {
    isConnected,
    address,
    connect: handleConnect,
    disconnect,
    isLoading: isPending,
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

