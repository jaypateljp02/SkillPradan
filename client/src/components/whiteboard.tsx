import { useRef, useEffect } from 'react';
import { useWhiteboard } from '@/hooks/use-whiteboard';
import { Button } from '@/components/ui/button';
import { 
  PencilLine, 
  Eraser, 
  Type, 
  Trash2,
  GripHorizontal 
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WhiteboardProps {
  sessionId: number;
}

export function Whiteboard({ sessionId }: WhiteboardProps) {
  const {
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
  } = useWhiteboard(sessionId);
  
  // Set canvas size based on container
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current || !containerRef.current) return;
      
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  // Color options
  const colorOptions = [
    { value: '#000000', label: 'Black' },
    { value: '#ff0000', label: 'Red' },
    { value: '#0000ff', label: 'Blue' },
    { value: '#008000', label: 'Green' },
    { value: '#ffa500', label: 'Orange' },
    { value: '#800080', label: 'Purple' }
  ];
  
  // Width options
  const widthOptions = [
    { value: 2, label: 'Thin' },
    { value: 5, label: 'Medium' },
    { value: 10, label: 'Thick' }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-t-lg p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={tool === 'pen' ? 'default' : 'outline'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setTool('pen')}
          >
            <PencilLine className="h-4 w-4" />
          </Button>
          
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setTool('eraser')}
          >
            <Eraser className="h-4 w-4" />
          </Button>
          
          <Button
            variant={tool === 'text' ? 'default' : 'outline'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setTool('text')}
          >
            <Type className="h-4 w-4" />
          </Button>
          
          <div className="h-6 border-l border-neutral-200 mx-1"></div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <div 
                  className="h-4 w-4 rounded-full border border-neutral-300" 
                  style={{ backgroundColor: color }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map(option => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    className={`h-8 flex items-center justify-center ${color === option.value ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setColor(option.value)}
                  >
                    <div 
                      className="h-4 w-4 rounded-full mr-2" 
                      style={{ backgroundColor: option.value }}
                    />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 p-0 px-2">
                <GripHorizontal className="h-4 w-4" />
                <span className="text-xs ml-1">{width}px</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="space-y-2">
                {widthOptions.map(option => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    className={`h-8 w-full flex items-center justify-between ${width === option.value ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setWidth(option.value)}
                  >
                    <span className="text-xs">{option.label}</span>
                    <div 
                      className="flex-grow mx-2 rounded-full bg-neutral-800" 
                      style={{ height: `${option.value}px` }}
                    />
                    <span className="text-xs">{option.value}px</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-destructive border-destructive hover:bg-destructive/10"
          onClick={clearWhiteboard}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
      
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 bg-white border-x border-b border-neutral-200 rounded-b-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        <canvas
          ref={canvasRef}
          className="touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}
