"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to record voice messages.");
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (audioUrl) {
    return (
      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200 w-full">
        <audio src={audioUrl} controls className="w-full mb-4" />
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50" onClick={onCancel}>Delete</Button>
          <Button className="flex-1" onClick={handleSend}>Send Voice Message</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200 w-full transition-all">
      {!isRecording ? (
        <div className="text-center w-full">
          <p className="text-sm text-gray-500 mb-4">Click to start recording</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={startRecording}>🎙️ Record</Button>
          </div>
        </div>
      ) : (
        <div className="text-center w-full">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-xl font-mono text-gray-900">{formatTime(recordingTime)}</span>
          </div>
          <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50" onClick={stopRecording}>
            ⏹️ Stop Recording
          </Button>
        </div>
      )}
    </div>
  );
}
