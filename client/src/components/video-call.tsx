import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/use-socket';
import Peer from 'simple-peer';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Phone,
  ScreenShare,
  StopCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  sessionId: number;
  username: string;
}

export function VideoCall({ sessionId, username }: VideoCallProps) {
  const { toast } = useToast();
  const { socket, videoSignals, sendVideoSignal } = useSocket();
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const localScreenStreamRef = useRef<MediaStream | null>(null);
  const originalStreamRef = useRef<MediaStream | null>(null);
  
  // Initialize the call
  const initializeCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      originalStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Create peer connection
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream
      });
      
      peer.on('signal', signal => {
        if (socket) {
          sendVideoSignal(sessionId, 'all', signal);
        }
      });
      
      peer.on('stream', stream => {
        setRemoteStream(stream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      });
      
      peerRef.current = peer;
      setIsCallActive(true);
      
      toast({
        title: "Call initialized",
        description: "Waiting for others to join..."
      });
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Failed to access camera/microphone",
        description: "Please ensure you have granted permission to use these devices",
        variant: "destructive"
      });
    }
  };
  
  // Handle incoming video signals
  useEffect(() => {
    if (!peerRef.current || !videoSignals) return;
    
    // Handle receiving a signal from another peer
    if (videoSignals && Object.keys(videoSignals).length > 0) {
      const signal = videoSignals[Object.keys(videoSignals)[0]];
      
      if (signal && !peerRef.current.destroyed) {
        peerRef.current.signal(signal);
      }
    }
  }, [videoSignals]);
  
  // Clean up streams when component unmounts
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (localScreenStreamRef.current) {
        localScreenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [localStream]);
  
  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };
  
  // Toggle screen sharing
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true 
        });
        
        // Save current stream to restore later
        localScreenStreamRef.current = screenStream;
        
        // Replace video track with screen share track
        if (peerRef.current && !peerRef.current.destroyed) {
          const videoTrack = localStream?.getVideoTracks()[0];
          const screenTrack = screenStream.getVideoTracks()[0];
          
          if (videoTrack && screenTrack) {
            const sender = peerRef.current.streams[0].getVideoTracks()[0];
            if (sender) {
              peerRef.current.replaceTrack(sender, screenTrack, peerRef.current.streams[0]);
            }
            
            // Update local video preview
            if (localVideoRef.current) {
              const newStream = new MediaStream();
              newStream.addTrack(screenTrack);
              localStream?.getAudioTracks().forEach(track => {
                newStream.addTrack(track);
              });
              localVideoRef.current.srcObject = newStream;
              setLocalStream(newStream);
            }
            
            // Add listener for when screen sharing stops
            screenTrack.onended = () => {
              toggleScreenShare();
            };
          }
        }
        
        setIsScreenSharing(true);
        
      } else {
        // Stop screen sharing and restore camera
        if (localScreenStreamRef.current) {
          localScreenStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Restore original video track
        if (peerRef.current && !peerRef.current.destroyed && originalStreamRef.current) {
          const videoTrack = originalStreamRef.current.getVideoTracks()[0];
          
          if (videoTrack) {
            const sender = peerRef.current.streams[0].getVideoTracks()[0];
            if (sender) {
              peerRef.current.replaceTrack(sender, videoTrack, peerRef.current.streams[0]);
            }
            
            // Update local video preview
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = originalStreamRef.current;
              setLocalStream(originalStreamRef.current);
            }
          }
        }
        
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        title: "Screen sharing failed",
        description: "Unable to share your screen",
        variant: "destructive"
      });
    }
  };
  
  // End call
  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (localScreenStreamRef.current) {
      localScreenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative min-h-[300px] bg-neutral-900 rounded-lg overflow-hidden">
        {/* Remote video (main display) */}
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-neutral-800">
            <div className="text-center">
              <UserAvatar
                name={username}
                size="lg"
                className="h-24 w-24 mx-auto mb-4"
              />
              <p className="text-white">Waiting for other participants...</p>
            </div>
          </div>
        )}
        
        {/* Local video (picture-in-picture) */}
        {localStream && (
          <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 bg-opacity-70">
                <UserAvatar
                  name={username}
                  size="md"
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Call controls */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        {!isCallActive ? (
          <Button 
            onClick={initializeCall}
            className="bg-green-500 hover:bg-green-600"
          >
            <Phone className="mr-2 h-4 w-4" /> Start Call
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className={`rounded-full p-3 ${isMuted ? 'bg-red-100 text-red-500' : ''}`}
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="outline"
              className={`rounded-full p-3 ${isVideoOff ? 'bg-red-100 text-red-500' : ''}`}
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="outline"
              className={`rounded-full p-3 ${isScreenSharing ? 'bg-green-100 text-green-500' : ''}`}
              onClick={toggleScreenShare}
            >
              {isScreenSharing ? <StopCircle className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
            </Button>
            
            <Button
              className="rounded-full p-3 bg-red-500 hover:bg-red-600 text-white"
              onClick={endCall}
            >
              <Phone className="h-5 w-5 rotate-135" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
