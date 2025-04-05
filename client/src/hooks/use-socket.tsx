import { createContext, ReactNode, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface SocketContextType {
  connected: boolean;
  socket: WebSocket | null;
  joinSession: (sessionId: number) => void;
  leaveSession: (sessionId: number) => void;
  sendWhiteboardUpdate: (sessionId: number, whiteboardData: any) => void;
  sendVideoSignal: (sessionId: number, target: string, signal: any) => void;
  sendChatMessage: (sessionId: number, message: string) => void;
  messages: ChatMessage[];
  users: Record<number, SessionUser>;
  whiteboardData: any;
  videoSignals: Record<string, any>;
}

interface ChatMessage {
  id: string;
  message: string;
  user: SessionUser;
  timestamp: string;
}

interface SessionUser {
  id: number;
  name: string;
  avatar?: string;
}

// Type guard for WebSocket state
const isWebSocketOpen = (ws: WebSocket | null): ws is WebSocket => {
  return ws !== null && ws.readyState === WebSocket.OPEN;
};

export const SocketContext = createContext<SocketContextType | null>(null);

// Mock placeholder messages
const placeholderMessages = [
  {
    id: '1',
    message: 'Welcome to the session chat!',
    user: {
      id: 0,
      name: 'System',
      avatar: undefined
    },
    timestamp: new Date().toISOString()
  }
];

// Create an actual WebSocket connection
export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(placeholderMessages);
  const [users, setUsers] = useState<Record<number, SessionUser>>({});
  const [whiteboardData, setWhiteboardData] = useState<any>(null);
  const [videoSignals, setVideoSignals] = useState<Record<string, any>>({});
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // Set a flag to track connection attempts
    let connectionAttempted = false;
    let ws: WebSocket | null = null;
    
    // Don't try to connect if already connected
    if (socket !== null) return;
    
    // Skip WebSocket connection on the auth page
    if (window.location.pathname === '/auth') {
      console.log("Skipping WebSocket connection on auth page");
      return;
    }
    
    // Only attempt WebSocket connection if user is authenticated
    if (!user) {
      console.log("No authentication method found");
      return;
    }
    
    // Initialize connection function
    const setupWebSocket = () => {
      // Create WebSocket connection with direct Replit URL
      // This avoids issues with proxies and undefined ports
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      console.log("Base URL for WebSocket:", `${window.location.protocol}//${host}`);
      
      try {
        console.log("Connecting to WebSocket server at:", wsUrl);
        ws = new WebSocket(wsUrl);
        
        // Set up WebSocket event handlers
        ws.onopen = () => {
          console.log("WebSocket connected");
          setConnected(true);
          toast({
            title: "Connected to server",
            description: "Real-time features are now available"
          });
        };
        
        ws.onclose = () => {
          console.log("WebSocket disconnected");
          setConnected(false);
          setSocket(null);
          
          // Only show toast if we've already had a connection and not on auth page
          if (connectionAttempted && window.location.pathname !== '/auth') {
            // Don't show connection lost toast on login page
            if (user) {
              toast({
                title: "Connection lost",
                description: "Trying to reconnect...",
                variant: "destructive"
              });
            }
            
            // Try to reconnect after a short delay if we're authenticated
            if (user) {
              setTimeout(() => {
                // Try to reconnect later
                if (window.location.pathname !== '/auth') {
                  setupWebSocket();
                }
              }, 3000);
            }
          }
        };
        
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          // Capture additional information for debugging
          const connectionDetails = {
            url: wsUrl,
            readyState: ws ? ws.readyState : 'no websocket',
            location: window.location.href,
            user: user ? { id: user.id, name: user.name } : 'not authenticated'
          };
          console.log("WebSocket error context:", connectionDetails);
          
          // We won't set connected to false here as the onclose handler will be called right after
          
          // If this is the first attempt, use fallback mode
          if (!connectionAttempted) {
            console.log("Using fallback mode without WebSockets");
            // We'll continue without WebSockets - the app will still work with limited functionality
          }
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("WebSocket message received:", data.type);
            
            switch (data.type) {
              case 'connection':
                // Handle successful connection
                console.log("WebSocket connection established with client ID:", data.payload.clientId);
                break;
                
              case 'user-joined':
                // Handle user joined session
                if (data.payload.userData) {
                  setUsers(prev => ({
                    ...prev,
                    [data.payload.userData.id]: {
                      id: data.payload.userData.id,
                      name: data.payload.userData.name,
                      avatar: data.payload.userData.avatar || undefined
                    }
                  }));
                  
                  // Add system message
                  setMessages(prev => [
                    ...prev,
                    {
                      id: `${Date.now()}-${Math.random()}`,
                      message: `${data.payload.userData.name} has joined the session`,
                      user: {
                        id: 0,
                        name: "System",
                        avatar: undefined
                      },
                      timestamp: new Date().toISOString()
                    }
                  ]);
                }
                break;
                
              case 'user-left':
                // Handle user left session
                if (data.payload.userId) {
                  // Add system message
                  const userName = users[data.payload.userId]?.name || "Someone";
                  setMessages(prev => [
                    ...prev,
                    {
                      id: `${Date.now()}-${Math.random()}`,
                      message: `${userName} has left the session`,
                      user: {
                        id: 0,
                        name: "System",
                        avatar: undefined
                      },
                      timestamp: new Date().toISOString()
                    }
                  ]);
                  
                  // Remove user from session
                  setUsers(prev => {
                    const newUsers = { ...prev };
                    delete newUsers[data.payload.userId];
                    return newUsers;
                  });
                }
                break;
                
              case 'chat-message':
                // Handle chat message
                if (data.payload.userData && data.payload.message) {
                  setMessages(prev => [
                    ...prev,
                    {
                      id: `${Date.now()}-${Math.random()}`,
                      message: data.payload.message,
                      user: {
                        id: data.payload.userData.id,
                        name: data.payload.userData.name,
                        avatar: data.payload.userData.avatar || undefined
                      },
                      timestamp: data.payload.timestamp || new Date().toISOString()
                    }
                  ]);
                }
                break;
                
              case 'whiteboard-update':
                // Handle whiteboard update
                if (data.payload.whiteboardData) {
                  setWhiteboardData(data.payload.whiteboardData);
                }
                break;
                
              case 'video-signal':
                // Handle video signal
                if (data.payload.fromClientId && data.payload.signal) {
                  setVideoSignals(prev => ({
                    ...prev,
                    [data.payload.fromClientId]: data.payload.signal
                  }));
                }
                break;
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };
        
        setSocket(ws);
        connectionAttempted = true;
      } catch (error) {
        console.error("Error setting up WebSocket:", error);
      }
    };
    
    // Wait a longer moment before trying to connect to allow authentication to complete
    const connectionTimeout = setTimeout(() => {
      setupWebSocket();
    }, 2500);  // Increased delay to ensure authentication is fully established
    
    // Clean up on unmount
    return () => {
      clearTimeout(connectionTimeout);
      
      // Close socket if it exists and is in a state that can be closed
      if (ws) {
        console.log("Cleaning up WebSocket connection");
        // Only close if the WebSocket is in a state where it can be closed
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      }
    };
  }, [toast, users, user]);

  // Join session
  const joinSession = useCallback((sessionId: number) => {
    if (!user || !isWebSocketOpen(socket)) {
      console.log("Cannot join session: user not authenticated or socket not connected");
      return;
    }
    
    setCurrentSessionId(sessionId);
    
    // Send join message to server
    socket.send(JSON.stringify({
      type: 'join-session',
      payload: {
        sessionId,
        userId: user.id
      }
    }));
    
    // Add current user to users list
    setUsers(prev => ({
      ...prev,
      [user.id]: {
        id: user.id,
        name: user.name,
        avatar: user.avatar || undefined
      }
    }));
    
    // Add system message
    setMessages([
      {
        id: `${Date.now()}-${Math.random()}`,
        message: "Welcome to the session!",
        user: {
          id: 0,
          name: "System",
          avatar: undefined
        },
        timestamp: new Date().toISOString()
      }
    ]);
    
    toast({
      title: "Session Joined",
      description: "You have joined the session successfully."
    });
  }, [user, socket, toast]);

  // Leave session
  const leaveSession = useCallback((sessionId: number) => {
    if (!user || !isWebSocketOpen(socket)) {
      return;
    }
    
    // Send leave message to server
    socket.send(JSON.stringify({
      type: 'leave-session',
      payload: {
        sessionId,
        userId: user.id
      }
    }));
    
    // Reset session data
    setCurrentSessionId(null);
    setUsers({});
    setMessages(placeholderMessages);
    setWhiteboardData(null);
    setVideoSignals({});
    
    toast({
      title: "Session Left",
      description: "You have left the session."
    });
  }, [user, socket, toast]);

  // Whiteboard update
  const sendWhiteboardUpdate = useCallback((sessionId: number, whiteboardData: any) => {
    if (!isWebSocketOpen(socket)) {
      console.log("Cannot send whiteboard update: socket not connected");
      setWhiteboardData(whiteboardData);
      return;
    }
    
    // Send update to server
    socket.send(JSON.stringify({
      type: 'whiteboard-update',
      payload: {
        sessionId,
        whiteboardData
      }
    }));
    
    // Update local state
    setWhiteboardData(whiteboardData);
  }, [socket]);

  // Video signal
  const sendVideoSignal = useCallback((sessionId: number, target: string, signal: any) => {
    if (!isWebSocketOpen(socket)) {
      console.log("Cannot send video signal: socket not connected");
      return;
    }
    
    // Send signal to server
    socket.send(JSON.stringify({
      type: 'video-signal',
      payload: {
        sessionId,
        target,
        signal
      }
    }));
  }, [socket]);

  // Chat message
  const sendChatMessage = useCallback((sessionId: number, message: string) => {
    if (!user) {
      console.log("Cannot send message: user not authenticated");
      return;
    }
    
    if (!isWebSocketOpen(socket)) {
      console.log("Cannot send message: socket not connected, using fallback");
      // Fallback to local message
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          message,
          user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar || undefined
          },
          timestamp: new Date().toISOString()
        }
      ]);
      return;
    }
    
    // Send message to server
    socket.send(JSON.stringify({
      type: 'chat-message',
      payload: {
        sessionId,
        message,
        userId: user.id
      }
    }));
    
    // Message will be added to state when server echoes it back
  }, [user, socket]);

  return (
    <SocketContext.Provider value={{
      connected,
      socket,
      joinSession,
      leaveSession,
      sendWhiteboardUpdate,
      sendVideoSignal,
      sendChatMessage,
      messages,
      users,
      whiteboardData,
      videoSignals
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
