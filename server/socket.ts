import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { userTokens } from "./token-auth";
import { firebaseUsers } from "./firebase-auth";
import { parse } from "url";

interface SocketMessage {
  type: string;
  payload: any;
}

export function setupWebSockets(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Map<string, WebSocket>();
  
  // Track active sessions and their participants
  const activeSessions = new Map<number, Set<string>>();
  
  wss.on('connection', async (ws, req) => {
    console.log('WebSocket client attempting to connect');
    
    // Log connection information for debugging
    const connectionInfo = {
      url: req.url,
      headers: req.headers,
      method: req.method
    };
    console.log('WebSocket connection details:', JSON.stringify(connectionInfo, null, 2));
    
    // We're keeping the connection open even without authentication
    // Authentication will be checked when users try to join sessions or perform actions
    console.log('WebSocket client connected');
    
    // Generate a unique client ID
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(clientId, ws);
    
    // Send client their ID
    ws.send(JSON.stringify({
      type: 'connection',
      payload: { clientId }
    }));
    
    ws.on('message', async (message) => {
      try {
        const { type, payload } = JSON.parse(message.toString()) as SocketMessage;
        
        switch (type) {
          case 'join-session': {
            const { sessionId, userId } = payload;
            
            // Get or create session participant set
            if (!activeSessions.has(sessionId)) {
              activeSessions.set(sessionId, new Set());
            }
            
            const participants = activeSessions.get(sessionId)!;
            participants.add(clientId);
            
            // Notify all session participants about new user
            const user = await storage.getUser(userId);
            if (user) {
              const { password, ...userData } = user;
              
              participants.forEach(participantId => {
                const client = clients.get(participantId);
                if (client && client.readyState === WebSocket.OPEN && participantId !== clientId) {
                  client.send(JSON.stringify({
                    type: 'user-joined',
                    payload: { userData, sessionId }
                  }));
                }
              });
            }
            
            break;
          }
          
          case 'leave-session': {
            const { sessionId, userId } = payload;
            
            if (activeSessions.has(sessionId)) {
              const participants = activeSessions.get(sessionId)!;
              participants.delete(clientId);
              
              // If no participants left, clean up
              if (participants.size === 0) {
                activeSessions.delete(sessionId);
              } else {
                // Notify remaining participants
                participants.forEach(participantId => {
                  const client = clients.get(participantId);
                  if (client && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                      type: 'user-left',
                      payload: { userId, sessionId }
                    }));
                  }
                });
              }
            }
            
            break;
          }
          
          case 'whiteboard-update': {
            const { sessionId, whiteboardData } = payload;
            
            if (activeSessions.has(sessionId)) {
              const participants = activeSessions.get(sessionId)!;
              
              // Save whiteboard data
              const session = await storage.getSession(sessionId);
              if (session) {
                await storage.updateSession(sessionId, { whiteboardData });
              }
              
              // Broadcast to all participants except sender
              participants.forEach(participantId => {
                const client = clients.get(participantId);
                if (client && client.readyState === WebSocket.OPEN && participantId !== clientId) {
                  client.send(JSON.stringify({
                    type: 'whiteboard-update',
                    payload: { whiteboardData, sessionId }
                  }));
                }
              });
            }
            
            break;
          }
          
          case 'video-signal': {
            const { sessionId, target, signal } = payload;
            
            if (activeSessions.has(sessionId)) {
              const participants = activeSessions.get(sessionId)!;
              
              // Find target client
              participants.forEach((participantId: string) => {
                const client = clients.get(participantId);
                if (client && client.readyState === WebSocket.OPEN && participantId !== clientId) {
                  client.send(JSON.stringify({
                    type: 'video-signal',
                    payload: { 
                      fromClientId: clientId,
                      signal,
                      sessionId
                    }
                  }));
                }
              });
            }
            
            break;
          }
          
          case 'chat-message': {
            const { sessionId, message, userId } = payload;
            
            if (activeSessions.has(sessionId)) {
              const participants = activeSessions.get(sessionId)!;
              
              // Get user info
              const user = await storage.getUser(userId);
              if (user) {
                const { password, ...userData } = user;
                
                // Broadcast to all participants
                participants.forEach(participantId => {
                  const client = clients.get(participantId);
                  if (client && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                      type: 'chat-message',
                      payload: { 
                        message, 
                        userData,
                        timestamp: new Date().toISOString(),
                        sessionId
                      }
                    }));
                  }
                });
              }
            }
            
            break;
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      
      // Remove from clients
      clients.delete(clientId);
      
      // Remove from all active sessions
      // Convert entries to array to avoid iterator issues
      Array.from(activeSessions.entries()).forEach(([sessionId, participants]) => {
        if (participants.has(clientId)) {
          participants.delete(clientId);
          
          // Notify other participants
          participants.forEach((participantId: string) => {
            const client = clients.get(participantId);
            if (client && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'user-left',
                payload: { clientId, sessionId }
              }));
            }
          });
          
          // If no participants left, clean up
          if (participants.size === 0) {
            activeSessions.delete(sessionId);
          }
        }
      });
    });
  });
  
  return wss;
}
