"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface CallInterfaceProps {
  isConfigured?: boolean;
  participantName: string;
  onClose: () => void;
}

export function CallInterface({ isConfigured = false, participantName, onClose }: CallInterfaceProps) {
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'rejected'>('idle');

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200 text-center space-y-4">
        <div className="text-4xl text-warning">⚠️</div>
        <h3 className="text-xl font-bold text-gray-900">CALLING CONFIGURATION REQUIRED</h3>
        <p className="text-sm text-gray-500 max-w-md">
          WebRTC or a third-party calling provider (e.g., Twilio, Agora) is not currently configured for this environment. 
          Real-time video/audio calling is disabled.
        </p>
        <Button onClick={onClose} variant="outline">Close Call Interface</Button>
      </div>
    );
  }

  // If configured, handle states
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg text-white space-y-6 w-full max-w-md mx-auto">
      <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-4xl mb-2">
        {participantName.charAt(0)}
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold">{participantName}</h3>
        <p className="text-gray-400 mt-1">
          {callState === 'idle' ? 'Ready to call' : 
           callState === 'calling' ? 'Calling...' : 
           callState === 'connected' ? 'Connected' : 'Call Rejected'}
        </p>
      </div>

      {callState === 'idle' && (
        <Button onClick={() => setCallState('calling')} className="w-full bg-green-600 hover:bg-green-700">
          Start Call
        </Button>
      )}

      {callState === 'calling' && (
        <div className="flex gap-4 w-full">
          <Button onClick={() => setCallState('idle')} className="flex-1 bg-red-600 hover:bg-red-700 border-none">
            Cancel
          </Button>
          {/* Mock accept for demo purposes */}
          <Button onClick={() => setCallState('connected')} className="flex-1 bg-green-600 hover:bg-green-700 border-none">
            (Mock Accept)
          </Button>
        </div>
      )}

      {callState === 'connected' && (
        <Button onClick={() => setCallState('idle')} className="w-full bg-red-600 hover:bg-red-700 border-none">
          End Call
        </Button>
      )}

      <Button onClick={onClose} variant="outline" className="w-full text-white border-gray-700 hover:bg-gray-800">
        Close Window
      </Button>
    </div>
  );
}
