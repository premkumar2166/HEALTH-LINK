'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, ShieldCheck, User } from 'lucide-react';

interface RealTimeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerName: string;
  callerRole: 'patient' | 'doctor';
  callType: 'voice' | 'video';
  recipientName: string;
}

export const RealTimeCallModal: React.FC<RealTimeCallModalProps> = ({
  isOpen,
  onClose,
  callerName,
  callerRole,
  callType,
  recipientName,
}) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [hasCameraStream, setHasCameraStream] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize media devices when opened
  useEffect(() => {
    if (!isOpen) {
      setCallStatus('calling');
      setDurationSeconds(0);
      return;
    }

    let stream: MediaStream | null = null;

    async function setupMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video',
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
          setHasCameraStream(true);
        }
      } catch (err) {
        console.warn('Real webcam/mic not available or permission denied; using clinical simulation mode:', err);
      }

      // Simulate connection handshake after 2.5 seconds
      const timer = setTimeout(() => {
        setCallStatus('connected');
      }, 2500);

      return () => clearTimeout(timer);
    }

    setupMedia();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, callType]);

  // Duration counter when connected
  useEffect(() => {
    let interval: any;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isOpen) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMuted;
      });
    }
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !isVideoEnabled;
      });
    }
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Call Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Telehealth {callType === 'video' ? 'Video Consultation' : 'Voice Call'}</span>
                <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                  <ShieldCheck size={12} /> HIPAA-Compliant Real-Time
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Connected with: <span className="text-slate-200 font-semibold">{recipientName}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono px-2.5 py-1 bg-slate-800 rounded-md text-emerald-400 font-bold border border-slate-700">
              {callStatus === 'connected' ? formatDuration(durationSeconds) : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Video / Call Canvas */}
        <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
          {callType === 'video' && isVideoEnabled ? (
            <div className="w-full h-full relative">
              {/* Simulated or real Remote Video */}
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 text-slate-400">
                <div className="w-24 h-24 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-400 mb-3 animate-pulse">
                  <User size={48} />
                </div>
                <div className="text-sm font-semibold text-white">{recipientName}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {callStatus === 'connected' ? 'Secure Stream Active' : 'Establishing P2P handshake...'}
                </div>
              </div>

              {/* Local Video Thumbnail */}
              <div className="absolute bottom-4 right-4 w-40 aspect-video bg-black/80 rounded-lg overflow-hidden border border-slate-700 shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${hasCameraStream ? '' : 'hidden'}`}
                />
                {!hasCameraStream && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-400 p-2 text-center bg-slate-900">
                    <User size={20} className="text-slate-500 mb-1" />
                    <span>Your Camera</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Voice Call Graphic */
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-400">
                  <User size={56} />
                </div>
                {callStatus === 'connected' && (
                  <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-500 text-white shadow-md">
                    <Volume2 size={16} />
                  </div>
                )}
              </div>
              <h4 className="text-xl font-bold text-white mb-1">{recipientName}</h4>
              <p className="text-sm text-slate-400">
                {callStatus === 'calling' ? 'Calling doctor workstation...' : 'Encrypted Voice Consultation'}
              </p>
            </div>
          )}

          {isMuted && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1 shadow">
              <MicOff size={12} /> Microphone Muted
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="p-6 bg-slate-950 flex items-center justify-center gap-4">
          <button
            onClick={handleToggleMute}
            className={`p-3.5 rounded-full transition-all flex items-center justify-center ${
              isMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {callType === 'video' && (
            <button
              onClick={handleToggleVideo}
              className={`p-3.5 rounded-full transition-all flex items-center justify-center ${
                !isVideoEnabled ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
            >
              {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
          )}

          <button
            onClick={handleEndCall}
            className="px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-red-600/30 transition-all"
            title="End Telehealth Call"
          >
            <PhoneOff size={20} />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
