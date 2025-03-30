import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  PencilLine, 
  Eraser, 
  Type, 
  Trash2,
  GripHorizontal,
  FileText 
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';

interface WhiteboardProps {
  sessionId: number;
}

export function Whiteboard({ sessionId }: WhiteboardProps) {
  const { toast } = useToast();
  
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

  // Show feature under development message
  const showFeatureMessage = () => {
    toast({
      title: "Collaborative Whiteboard",
      description: "This feature is currently being upgraded to a more browser-compatible solution.",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-t-lg p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={showFeatureMessage}
          >
            <PencilLine className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={showFeatureMessage}
          >
            <Eraser className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={showFeatureMessage}
          >
            <Type className="h-4 w-4" />
          </Button>
          
          <div className="h-6 border-l border-neutral-200 mx-1"></div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={showFeatureMessage}>
                <div 
                  className="h-4 w-4 rounded-full border border-neutral-300" 
                  style={{ backgroundColor: '#000000' }}
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
                    className="h-8 flex items-center justify-center"
                    onClick={showFeatureMessage}
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
              <Button variant="outline" size="sm" className="h-8 p-0 px-2" onClick={showFeatureMessage}>
                <GripHorizontal className="h-4 w-4" />
                <span className="text-xs ml-1">2px</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="space-y-2">
                {widthOptions.map(option => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    className="h-8 w-full flex items-center justify-between"
                    onClick={showFeatureMessage}
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
          onClick={showFeatureMessage}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
      
      {/* Placeholder for whiteboard */}
      <div 
        className="flex-1 bg-white border-x border-b border-neutral-200 rounded-b-lg overflow-hidden flex items-center justify-center"
        style={{ minHeight: '400px' }}
      >
        <div className="text-center p-8">
          <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Collaborative Whiteboard</h3>
          <p className="text-neutral-500 max-w-md">
            The collaborative whiteboard feature is currently being upgraded to ensure compatibility across all browsers. 
            Check back soon for an improved experience!
          </p>
        </div>
      </div>
    </div>
  );
}
