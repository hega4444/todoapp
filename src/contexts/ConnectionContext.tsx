'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ConnectionStatus = 'online' | 'offline' | 'error';

interface ConnectionContextType {
  status: ConnectionStatus;
  setOffline: () => void;
  setOnline: () => void;
  setError: () => void;
  lastErrorTime: Date | null;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

interface ConnectionProviderProps {
  children: ReactNode;
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [lastErrorTime, setLastErrorTime] = useState<Date | null>(null);

  // Auto-recovery after 30 seconds
  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => {
        setStatus('online');
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [status]);

  const setOffline = () => {
    setStatus('offline');
    setLastErrorTime(new Date());
  };

  const setOnline = () => {
    setStatus('online');
    setLastErrorTime(null);
  };

  const setError = () => {
    setStatus('error');
    setLastErrorTime(new Date());
  };

  const value: ConnectionContextType = {
    status,
    setOffline,
    setOnline,
    setError,
    lastErrorTime,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}