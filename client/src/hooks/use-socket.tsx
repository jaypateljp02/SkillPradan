import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";

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

export const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Record<number, SessionUser>>({});
  const [whiteboardData, setWhiteboardData] = useState<any>(null);
  const [videoSignals, setVideoSignals] = useState<Record<string, any>>({});
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  // Connect to WebSocket server
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connection':
            setClientId(data.payload.clientId);
            break;
            
          case 'user-joined':
            const joinedUser = data.payload.userData;
            setUsers(prev => ({
              ...prev,
              [joinedUser.id]: {
                id: joinedUser.id,
                name: joinedUser.name,
                avatar: joinedUser.avatar
              }
            }));
            break;
            
          case 'user-left':
            const leftUserId = data.payload.userId;
            setUsers(prev => {
              const newUsers = { ...prev };
              delete newUsers[leftUserId];
              return newUsers;
            });
            break;
            
          case 'whiteboard-update':
            setWhiteboardData(data.payload.whiteboardData);
            break;
            
          case 'video-signal':
            setVideoSignals(prev => ({
              ...prev,
              [data.payload.fromClientId]: data.payload.signal
            }));
            break;
            
          case 'chat-message':
            const messageData = data.payload;
            setMessages(prev => [
              ...prev,
              {
                id: `${Date.now()}-${Math.random()}`,
                message: messageData.message,
                user: {
                  id: messageData.userData.id,
                  name: messageData.userData.name,
                  avatar: messageData.userData.avatar
                },
                timestamp: messageData.timestamp
              }
            ]);
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user]);

  const joinSession = useCallback((sessionId: number) => {
    if (socket && socket.readyState === WebSocket.OPEN && user) {
      socket.send(JSON.stringify({
        type: 'join-session',
        payload: { sessionId, userId: user.id }
      }));
      setCurrentSessionId(sessionId);
      
      // Reset session state
      setMessages([]);
      setWhiteboardData(null);
      setVideoSignals({});
      
      // Add current user to users list
      setUsers({
        [user.id]: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        }
      });
    }
  }, [socket, user]);

  const leaveSession = useCallback((sessionId: number) => {
    if (socket && socket.readyState === WebSocket.OPEN && user) {
      socket.send(JSON.stringify({
        type: 'leave-session',
        payload: { sessionId, userId: user.id }
      }));
      setCurrentSessionId(null);
    }
  }, [socket, user]);

  const sendWhiteboardUpdate = useCallback((sessionId: number, whiteboardData: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'whiteboard-update',
        payload: { sessionId, whiteboardData }
      }));
      setWhiteboardData(whiteboardData);
    }
  }, [socket]);

  const sendVideoSignal = useCallback((sessionId: number, target: string, signal: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'video-signal',
        payload: { sessionId, target, signal }
      }));
    }
  }, [socket]);

  const sendChatMessage = useCallback((sessionId: number, message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN && user) {
      socket.send(JSON.stringify({
        type: 'chat-message',
        payload: { sessionId, message, userId: user.id }
      }));
      
      // Add message to local state
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          message,
          user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          },
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [socket, user]);

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
