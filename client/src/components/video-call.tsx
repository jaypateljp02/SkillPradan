import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { Video, Phone, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  sessionId: number;
  username: string;
}

export function VideoCall({ sessionId, username }: VideoCallProps) {
  const { toast } = useToast();
  
  // Temporary placeholder function to show a toast notification
  const showFeatureMessage = () => {
    toast({
      title: "Video Call Feature",
      description: "This feature is currently being upgraded to a more browser-compatible solution.",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative min-h-[300px] bg-neutral-900 rounded-lg overflow-hidden">
        {/* Placeholder for video call */}
        <div className="flex items-center justify-center h-full bg-neutral-800">
          <div className="text-center">
            <UserAvatar
              name={username}
              size="lg"
              className="h-24 w-24 mx-auto mb-4"
            />
            <p className="text-white">Video call functionality is being upgraded</p>
            <p className="text-gray-400 text-sm mt-2">We're implementing a more browser-compatible solution</p>
          </div>
        </div>
      </div>
      
      {/* Call controls */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        <Button 
          onClick={showFeatureMessage}
          className="bg-green-500 hover:bg-green-600"
        >
          <Phone className="mr-2 h-4 w-4" /> Start Call
        </Button>
      </div>
    </div>
  );
}
