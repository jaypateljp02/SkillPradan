import { useSocket } from '@/hooks/use-socket';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';

export function ConnectionStatus() {
  const { connected } = useSocket();
  const [location] = useLocation();
  const [showStatus, setShowStatus] = useState(false);

  // Only show connection status on authenticated pages (not auth page)
  const isAuthPage = location === '/auth';

  // Check if we're on a page that requires real-time features
  const requiresRealtime = location.includes('/session') || location.includes('/messages');

  useEffect(() => {
    // Don't show any status on the auth page or pages that don't need WebSocket
    if (isAuthPage || !requiresRealtime) {
      setShowStatus(false);
      return;
    }

    // Only show status when disconnected AND on a page that needs real-time features
    if (!connected) {
      // Give a grace period before showing disconnected status
      const timer = setTimeout(() => {
        setShowStatus(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowStatus(false);
    }
  }, [connected, isAuthPage, requiresRealtime]);

  // Don't render if not needed
  if (!showStatus || isAuthPage || !requiresRealtime) return null;

  // Render connection status
  return (
    <div className={`fixed bottom-4 right-4 transition-all duration-500 ease-in-out z-50
      ${showStatus ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
        <span className="font-medium text-sm">
          Connecting to real-time features...
        </span>
      </div>
    </div>
  );
}