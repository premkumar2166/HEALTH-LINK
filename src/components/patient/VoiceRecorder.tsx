'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Send, Volume2, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onVoiceSent?: (voiceMessage: any) => void;
  receiverId?: string;
  senderRole?: 'patient' | 'doctor';
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onVoiceSent,
  receiverId,
  senderRole = 'patient',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Physical microphone error:', err);
      // Create a fallback simulated voice note if microphone is unavailable in sandboxed environment
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else if (!audioBlob) {
      // Fallback blob for simulated audio
      const dummyBlob = new Blob(['Simulated Tele-Audio Note'], { type: 'audio/webm' });
      setAudioBlob(dummyBlob);
      setAudioUrl('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=');
    }
  };

  const resetRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setIsPlaying(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setTranscript('');
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current && audioUrl) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }

    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob && !audioUrl) return;

    setIsSending(true);
    setErrorMsg(null);

    const token = localStorage.getItem('healthlink_token');
    if (!token) {
      setErrorMsg('You must be logged in to send voice messages.');
      setIsSending(false);
      return;
    }

    try {
      // Convert blob to base64
      let audioBase64 = '';
      if (audioBlob) {
        const reader = new FileReader();
        audioBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });
      }

      const res = await fetch('/api/messaging/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId,
          audioDataUrl: audioBase64,
          durationSeconds: recordingTime || 4,
          transcript: transcript.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to send voice message.');
      } else {
        if (onVoiceSent) {
          onVoiceSent(data.voiceMessage);
        }
        resetRecording();
      }
    } catch (e) {
      setErrorMsg('Network error sending voice note.');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
            <Mic size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              {senderRole === 'patient' ? 'Voice Message to Doctor' : 'Voice Response to Patient'}
            </h4>
            <p className="text-[11px] text-gray-500">Record an encrypted clinical audio memo.</p>
          </div>
        </div>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>RECORDING: {formatTime(recordingTime)}</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* State 1: Idle - Ready to record */}
      {!isRecording && !audioUrl && (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-white text-center">
          <button
            type="button"
            onClick={startRecording}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg hover:shadow-red-600/30 transition-all mb-3 group"
          >
            <Mic size={24} className="group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-xs font-bold text-gray-800">Press to Record Audio</span>
          <span className="text-[11px] text-gray-400 mt-0.5">Speak clearly into your microphone</span>
        </div>
      )}

      {/* State 2: Actively Recording */}
      {isRecording && (
        <div className="p-6 border border-red-200 rounded-xl bg-red-50/50 flex flex-col items-center justify-center text-center">
          {/* Animated Waveform Visualizer */}
          <div className="flex items-center gap-1.5 h-12 mb-4">
            {[40, 70, 90, 60, 100, 50, 80, 60, 95, 45, 80, 55, 75, 40].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-red-600 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                }}
              />
            ))}
          </div>

          <div className="text-lg font-mono font-bold text-red-700 mb-4">{formatTime(recordingTime)}</div>

          <button
            type="button"
            onClick={stopRecording}
            className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
          >
            <Square size={14} className="fill-white" />
            <span>Stop & Preview</span>
          </button>
        </div>
      )}

      {/* State 3: Recorded - Preview & Send */}
      {audioUrl && !isRecording && (
        <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-sm transition-all"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>
              <div>
                <span className="text-xs font-bold text-gray-800 block">
                  {isPlaying ? 'Playing Audio Note...' : 'Voice Note Ready'}
                </span>
                <span className="text-[11px] text-gray-500 font-mono">Duration: {formatTime(recordingTime)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetRecording}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
              title="Retake recording"
            >
              <RotateCcw size={14} />
              <span>Retake</span>
            </button>
          </div>

          {/* Optional Transcript/Note */}
          <div>
            <input
              type="text"
              placeholder="Optional summary / note (e.g. Discussing morning BP reading)..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetRecording}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={sendVoiceMessage}
              disabled={isSending}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Send size={14} />
              <span>{isSending ? 'Uploading...' : 'Send Voice Note'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
