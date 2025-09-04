'use client';

import { useState, useEffect } from 'react';
import { ConnectionStatus } from '@/types';
import { CONNECTION_BADGE_TIMER } from '@/lib/constants';

interface ConnectionBadgeProps {
  status: ConnectionStatus;
}

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status === 'error' || status === 'offline') {
      setIsVisible(true);
      // Auto-hide error badges after
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, CONNECTION_BADGE_TIMER);
      return () => clearTimeout(timer);
    } else {
      // Immediately hide when online
      setIsVisible(false);
    }
  }, [status]);

  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'error':
        return {
          icon: '⚠️',
          message: 'Connection lost',
          subMessage: 'Try again later',
          variant: 'error',
        };
      case 'offline':
        return {
          icon: '📡',
          message: "You're offline",
          subMessage: 'Try again later',
          variant: 'warning',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div
      className={`fixed top-6 right-20 z-40 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out transform hover:scale-105 connection-badge connection-badge-${config.variant}`}
      style={{
        animation: isVisible
          ? 'slideInFromRight 0.3s ease-out'
          : 'slideOutToRight 0.3s ease-in',
        backgroundColor: 'var(--bg-secondary)',
        borderColor:
          config.variant === 'error'
            ? 'var(--status-error)'
            : 'var(--status-warning)',
        borderWidth: '1px',
        borderStyle: 'solid',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-connection-badge)',
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-lg"
          style={{
            color:
              config.variant === 'error'
                ? 'var(--status-error)'
                : 'var(--status-warning)',
          }}
        >
          {config.icon}
        </span>
        <div className="flex flex-col">
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {config.message}
          </span>
          <span
            className="text-xs opacity-75"
            style={{ color: 'var(--text-secondary)' }}
          >
            {config.subMessage}
          </span>
        </div>
      </div>
    </div>
  );
}
