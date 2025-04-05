import { useSocket } from '@/hooks/use-socket';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';

export function ConnectionStatus() {
  const { connected } = useSocket();
  const [location] = useLocation();
  const [showStatus, setShowStatus] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  
  // Only show connection status on authenticated pages (not auth page)
  const isAuthPage = location === '/auth';
  
  useEffect(() => {
    // Don't show any status on the auth page
    if (isAuthPage) return;
    
    // Only show status when disconnected
    if (!connected) {
      // Give a short grace period before showing disconnected status
      // to avoid flashing during page transitions
      const timer = setTimeout(() => {
        setShowStatus(true);
        setReconnecting(true);
        setReconnectCount(prev => prev + 1);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      // If connection restored, hide after a short delay
      if (showStatus) {
        const timer = setTimeout(() => {
          setShowStatus(false);
          setReconnecting(false);
        }, 1500);
        
        return () => clearTimeout(timer);
      }
      
      setShowStatus(false);
      setReconnecting(false);
    }
  }, [connected, isAuthPage, showStatus]);
  
  // Don't render anything on auth page or when connected
  if (isAuthPage || (!showStatus && connected)) return null;
  
  // Don't show more than 3 reconnect attempts to avoid UI noise
  if (reconnectCount > 3 && !connected) return null;
  
  // Render connection status
  return (
    <div className={`fixed bottom-0 left-0 right-0 transition-all duration-500 ease-in-out
      ${showStatus ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="bg-red-500 text-white p-3 flex justify-between items-center">
        <span className="font-medium">
          {reconnecting ? 'Connection lost. Trying to reconnect...' : 'Connected!'}
        </span>
        {reconnecting && (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
        )}
      </div>
    </div>
  );
}