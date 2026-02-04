import React, { useEffect, useRef, useState, useCallback } from 'react';
import { socketService } from '../services/socket';

const VideoFeeds = ({ isStrangerConnected, isVideoMode = true }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteStreamActive, setRemoteStreamActive] = useState(false);

  // Handle video mode changes
  useEffect(() => {
    if (!isVideoMode) {
      // Stop all tracks when switching to text-only mode
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setHasPermission(true);
          // Reset states when camera is set up
          setIsMuted(false);
          setIsVideoOff(false);
          
          // Set local stream for WebRTC
          socketService.setLocalStream(stream);
        }
      } catch (err) {
        console.error("Camera access denied", err);
        setHasPermission(false);
      }
    }
    setupCamera();

    // Set up remote stream callback
    socketService.setRemoteStreamCallback((remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        setRemoteStreamActive(!!remoteStream); // false if null, true otherwise
      } else {
        setRemoteStreamActive(false);
      }
    });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoMode]);

  // Clear remote video when partner disconnects
  useEffect(() => {
    if (!isStrangerConnected && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [isStrangerConnected]);

  // Derive hasRemoteStream from state and connection status
  const hasRemoteStream = remoteStreamActive && isStrangerConnected;

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const newMutedState = !isMuted;
        audioTracks.forEach(track => {
          track.enabled = !newMutedState; // enabled = true means NOT muted
        });
        setIsMuted(newMutedState);
      }
    }
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const newVideoOffState = !isVideoOff;
        videoTracks.forEach(track => {
          track.enabled = !newVideoOffState; // enabled = true means video is ON
        });
        setIsVideoOff(newVideoOffState);
      }
    }
  }, [isVideoOff]);

  // Don't render video feeds in text-only mode
  if (!isVideoMode) {
    return null;
  }

  return (
    <div className="w-full lg:w-1/2 flex flex-col gap-2 sm:gap-4">
      {/* Remote Stranger Feed */}
      <div className="flex-1 min-h-[150px] sm:min-h-[200px] relative bg-slate-100 dark:bg-black/80 glitch-border rounded overflow-hidden group">
        {/* Remote video element - Black & White filter */}
        <video 
          ref={remoteVideoRef}
          autoPlay 
          playsInline 
          className={`absolute inset-0 w-full h-full object-cover grayscale brightness-90 contrast-110 ${hasRemoteStream ? '' : 'hidden'}`}
        />
        
        {/* Placeholder when no remote stream */}
        {!hasRemoteStream && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <span className="material-symbols-outlined text-6xl sm:text-9xl">
              {isStrangerConnected ? 'person' : 'person_search'}
            </span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
        
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center space-x-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
          <span className={`w-2 h-2 rounded-full ${isStrangerConnected ? 'bg-red-600 animate-pulse' : 'bg-yellow-500'}`}></span>
          <span className="text-[8px] sm:text-[10px] uppercase font-bold text-white tracking-widest">
            {hasRemoteStream ? 'Live_Stranger' : isStrangerConnected ? 'Connecting Video...' : 'Searching...'}
          </span>
        </div>
        
        <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-[8px] sm:text-[10px] text-primary/70 font-mono">
          {hasRemoteStream ? 'STREAM: ACTIVE' : isStrangerConnected ? 'STREAM: PENDING' : 'IP: SEARCHING...'}
        </div>

        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        {/* Subtle scanline for specific feed */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      </div>

      {/* Localhost Feed */}
      <div className="h-[120px] sm:h-[150px] lg:h-1/3 relative bg-slate-100 dark:bg-black/80 border border-primary/20 rounded overflow-hidden group">
        {/* Video off overlay */}
        {(isVideoOff || !hasPermission) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
            <span className="material-symbols-outlined text-4xl sm:text-6xl opacity-30">
              {isVideoOff ? 'videocam_off' : 'videocam_off'}
            </span>
            <span className="text-[10px] sm:text-xs text-white/50 mt-2 uppercase tracking-widest">
              {isVideoOff ? 'Camera Off' : 'No Camera Access'}
            </span>
          </div>
        )}
        
        <video 
          ref={localVideoRef} 
          autoPlay 
          muted 
          playsInline 
          className={`w-full h-full object-cover grayscale brightness-75 contrast-125 scale-x-[-1] ${isVideoOff ? 'opacity-0' : ''}`}
        />

        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center space-x-2 bg-primary/20 backdrop-blur-sm px-2 py-1 rounded border border-primary/30">
          <span className={`w-2 h-2 rounded-full ${isVideoOff && isMuted ? 'bg-red-500' : 'bg-primary'}`}></span>
          <span className="text-[8px] sm:text-[10px] uppercase font-bold text-primary tracking-widest">You</span>
        </div>
        
        {/* Control Buttons */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex space-x-2">
          <button 
            onClick={toggleMute}
            className={`p-1.5 sm:p-2 transition-all rounded-full ${
              isMuted 
                ? 'bg-red-500/80 text-white hover:bg-red-600' 
                : 'bg-black/40 hover:bg-black/60 hover:text-primary'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <span className="material-symbols-outlined text-sm sm:text-base">
              {isMuted ? 'mic_off' : 'mic'}
            </span>
          </button>
          <button 
            onClick={toggleVideo}
            className={`p-1.5 sm:p-2 transition-all rounded-full ${
              isVideoOff 
                ? 'bg-red-500/80 text-white hover:bg-red-600' 
                : 'bg-black/40 hover:bg-black/60 hover:text-primary'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            <span className="material-symbols-outlined text-sm sm:text-base">
              {isVideoOff ? 'videocam_off' : 'videocam'}
            </span>
          </button>
        </div>

        {/* Muted indicator */}
        {isMuted && (
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex items-center space-x-1 bg-red-500/80 backdrop-blur-sm px-2 py-0.5 rounded">
            <span className="material-symbols-outlined text-xs text-white">mic_off</span>
            <span className="text-[8px] sm:text-[10px] uppercase font-bold text-white tracking-widest">Muted</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoFeeds;
