import { createContext, ReactNode, useContext, useState, useCallback } from "react";
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

// This is a simplified version for development - no actual WebSocket connection
export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(placeholderMessages);
  const [users, setUsers] = useState<Record<number, SessionUser>>({});
  const [whiteboardData, setWhiteboardData] = useState<any>(null);
  const [videoSignals, setVideoSignals] = useState<Record<string, any>>({});

  // Join session - placeholder
  const joinSession = useCallback((sessionId: number) => {
    if (user) {
      // Add current user to users list with proper type handling
      setUsers(prev => ({
        ...prev,
        [user.id]: {
          id: user.id,
          name: user.name,
          // Ensure avatar is string or undefined, not null
          avatar: user.avatar || undefined
        }
      }));
      
      toast({
        title: "Session Joined",
        description: "Some features are currently being upgraded for better browser compatibility."
      });
    }
  }, [user, toast]);

  // Leave session - placeholder
  const leaveSession = useCallback((sessionId: number) => {
    // No real action needed in this simplified version
  }, []);

  // Whiteboard update - placeholder
  const sendWhiteboardUpdate = useCallback((sessionId: number, whiteboardData: any) => {
    setWhiteboardData(whiteboardData);
  }, []);

  // Video signal - placeholder
  const sendVideoSignal = useCallback((sessionId: number, target: string, signal: any) => {
    // No real action needed in this simplified version
  }, []);

  // Chat message - simplified to only work locally
  const sendChatMessage = useCallback((sessionId: number, message: string) => {
    if (user) {
      // Add message to local state only with proper type handling
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          message,
          user: {
            id: user.id,
            name: user.name,
            // Ensure avatar is string or undefined, not null
            avatar: user.avatar || undefined
          },
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{
      connected: true, // Always return connected for simplified version
      socket: null,
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
