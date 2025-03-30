import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from '@/hooks/use-socket';

type Tool = 'pen' | 'eraser' | 'text';
type DrawOperation = {
  tool: Tool;
  color?: string;
  width?: number;
  points?: { x: number; y: number }[];
  text?: { x: number; y: number; content: string };
};

interface WhiteboardState {
  operations: DrawOperation[];
}

export function useWhiteboard(sessionId: number) {
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [operations, setOperations] = useState<DrawOperation[]>([]);
  const [currentOperation, setCurrentOperation] = useState<DrawOperation | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const { sendWhiteboardUpdate, whiteboardData } = useSocket();
  
  // Initialize canvas context
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctxRef.current = ctx;
    }
  }, [color, width]);
  
  // Sync with whiteboard data from socket
  useEffect(() => {
    if (whiteboardData && ctxRef.current) {
      setOperations(whiteboardData.operations);
      redrawCanvas();
    }
  }, [whiteboardData]);
  
  // Redraw canvas whenever operations change
  const redrawCanvas = useCallback(() => {
    if (!ctxRef.current || !canvasRef.current) return;
    
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    operations.forEach(operation => {
      if (operation.tool === 'pen' && operation.points && operation.points.length > 0) {
        ctx.strokeStyle = operation.color || '#000000';
        ctx.lineWidth = operation.width || 2;
        
        ctx.beginPath();
        ctx.moveTo(operation.points[0].x, operation.points[0].y);
        
        for (let i = 1; i < operation.points.length; i++) {
          ctx.lineTo(operation.points[i].x, operation.points[i].y);
        }
        
        ctx.stroke();
      } else if (operation.tool === 'text' && operation.text) {
        ctx.font = '16px Arial';
        ctx.fillStyle = operation.color || '#000000';
        ctx.fillText(operation.text.content, operation.text.x, operation.text.y);
      }
    });
  }, [operations]);
  
  // Update canvas on operations change
  useEffect(() => {
    redrawCanvas();
  }, [operations, redrawCanvas]);
  
  // Start drawing
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'pen') {
      setIsDrawing(true);
      setCurrentOperation({
        tool,
        color,
        width,
        points: [{ x, y }]
      });
    } else if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newOperation: DrawOperation = {
          tool,
          color,
          text: { x, y, content: text }
        };
        
        setOperations(prev => {
          const newOperations = [...prev, newOperation];
          sendWhiteboardUpdate(sessionId, { operations: newOperations });
          return newOperations;
        });
      }
    }
  }, [tool, color, width, sendWhiteboardUpdate, sessionId]);
  
  // Draw
  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentOperation || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'pen' && currentOperation.points) {
      setCurrentOperation(prev => {
        if (!prev || !prev.points) return prev;
        return {
          ...prev,
          points: [...prev.points, { x, y }]
        };
      });
    }
  }, [isDrawing, currentOperation, tool]);
  
  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (isDrawing && currentOperation) {
      setIsDrawing(false);
      
      setOperations(prev => {
        const newOperations = [...prev, currentOperation];
        sendWhiteboardUpdate(sessionId, { operations: newOperations });
        return newOperations;
      });
      
      setCurrentOperation(null);
    }
  }, [isDrawing, currentOperation, sendWhiteboardUpdate, sessionId]);
  
  // Clear whiteboard
  const clearWhiteboard = useCallback(() => {
    setOperations([]);
    sendWhiteboardUpdate(sessionId, { operations: [] });
    
    if (ctxRef.current && canvasRef.current) {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [sendWhiteboardUpdate, sessionId]);
  
  return {
    canvasRef,
    tool,
    setTool,
    color,
    setColor,
    width,
    setWidth,
    startDrawing,
    draw,
    stopDrawing,
    clearWhiteboard
  };
}
