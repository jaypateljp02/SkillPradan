import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type Tool = 'pen' | 'eraser' | 'text';

// Simplified placeholder version of the whiteboard hook
export function useWhiteboard(sessionId: number) {
  const { toast } = useToast();
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(2);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Placeholder functions that show toast messages instead of actual functionality
  const showFeatureMessage = useCallback(() => {
    toast({
      title: "Whiteboard Feature",
      description: "This feature is currently being upgraded to a more browser-compatible solution."
    });
  }, [toast]);
  
  // All functions are placeholders that just show the toast message
  const startDrawing = useCallback(() => {
    showFeatureMessage();
  }, [showFeatureMessage]);
  
  const draw = useCallback(() => {
    // No functionality for now
  }, []);
  
  const stopDrawing = useCallback(() => {
    // No functionality for now
  }, []);
  
  const clearWhiteboard = useCallback(() => {
    showFeatureMessage();
  }, [showFeatureMessage]);
  
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