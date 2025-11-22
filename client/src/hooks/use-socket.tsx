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

  // Helper function to setup WebSocket connection
  const setupWebSocket = useCallback(() => {
    // Don't create duplicate connections
    if (socket !== null) {
      console.log("WebSocket already connected");
      return;
    }

    // Skip WebSocket connection on the auth page
    if (window.location.pathname === '/auth') {
      console.log("Skipping WebSocket connection on auth page");
      return;
    }

    // Only attempt WebSocket connection if user is authenticated
    if (!user) {
      console.log("No authentication - skipping WebSocket");
      return;
    }

    const envWs = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_WS_URL) ? (import.meta as any).env.VITE_WS_URL as string : null;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const defaultWs = `${protocol}//${host}/ws`;
    const wsUrl = envWs || defaultWs;

    try {
      console.log("Connecting to WebSocket server at:", wsUrl);
      const ws = new WebSocket(wsUrl);

      // Set up WebSocket event handlers
      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);

        // Send authentication message with user ID
        if (user) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            payload: { userId: user.id }
          }));
        }

        toast({
          title: "Real-time features enabled",
          description: "You can now use live sessions and chat"
        });
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        setSocket(null);

        // Only auto-reconnect if we're in an active session
        if (currentSessionId !== null && window.location.pathname !== '/auth' && user) {
          setTimeout(() => {
            if (currentSessionId !== null && window.location.pathname !== '/auth') {
              setupWebSocket();
            }
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        // Silent fail - the app works fine without WebSockets
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data.type);

          switch (data.type) {
            case 'connection':
              console.log("WebSocket connection established with client ID:", data.payload.clientId);
              break;

            case 'user-joined':
              if (data.payload.userData) {
                setUsers(prev => ({
                  ...prev,
                  [data.payload.userData.id]: {
                    id: data.payload.userData.id,
                    name: data.payload.userData.name,
                    avatar: data.payload.userData.avatar || undefined
                  }
                }));

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
              if (data.payload.userId) {
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

                setUsers(prev => {
                  const newUsers = { ...prev };
                  delete newUsers[data.payload.userId];
                  return newUsers;
                });
              }
              break;

            case 'chat-message':
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
              if (data.payload.whiteboardData) {
                setWhiteboardData(data.payload.whiteboardData);
              }
              break;

            case 'video-signal':
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
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
    }
  }, [socket, user, toast, currentSessionId, users]);

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log("Cleaning up WebSocket connection");
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      }
    };
  }, [socket]);

  // Join session
  const joinSession = useCallback((sessionId: number) => {
    if (!user) {
      console.log("Cannot join session: user not authenticated");
      return;
    }

    setCurrentSessionId(sessionId);

    // Initialize WebSocket if not already connected
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("Initializing WebSocket for session...");
      setupWebSocket();

      // Wait for connection before sending join message
      const checkConnection = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          clearInterval(checkConnection);
          sendJoinMessage();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkConnection);
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          console.log("WebSocket connection timeout - using fallback mode");
          // Still allow joining in fallback mode
          addLocalJoinMessage();
        }
      }, 5000);
    } else {
      sendJoinMessage();
    }

    function sendJoinMessage() {
      if (!isWebSocketOpen(socket)) return;

      socket.send(JSON.stringify({
        type: 'join-session',
        payload: {
          sessionId,
          userId: user!.id
        }
      }));

      addLocalJoinMessage();
    }

    function addLocalJoinMessage() {
      // Add current user to users list
      setUsers(prev => ({
        ...prev,
        [user!.id]: {
          id: user!.id,
          name: user!.name,
          avatar: user!.avatar || undefined
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
    }
  }, [user, socket, toast, setupWebSocket]);

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
