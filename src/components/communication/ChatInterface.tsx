"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { VoiceRecorder } from './VoiceRecorder';
import { ImageUploader } from './ImageUploader';
import { CallInterface } from './CallInterface';

export type MessageType = 'text' | 'voice' | 'image' | 'document';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content: string; // text or url
  caption?: string;
  timestamp: string;
  read: boolean;
}

interface ChatInterfaceProps {
  currentUserId: string;
  participantId: string;
  participantName: string;
  initialMessages: ChatMessage[];
}

export function ChatInterface({ currentUserId, participantId, participantName, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTool, setActiveTool] = useState<'none' | 'voice' | 'image' | 'call'>('none');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTool]);

  // Simulate remote typing
  useEffect(() => {
    if (inputText.length > 0 && !isTyping) {
      // Simulate that typing events are sent to server
    }
  }, [inputText, isTyping]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUserId,
      senderName: 'Me',
      type: 'text',
      content: inputText,
      timestamp: new Date().toISOString(),
      read: false, // will turn true when other user reads
    };

    setMessages([...messages, newMsg]);
    setInputText('');

    // Simulate reply
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyMsg: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: participantId,
          senderName: participantName,
          type: 'text',
          content: 'I received your message.',
          timestamp: new Date().toISOString(),
          read: true,
        };
        setMessages(prev => [...prev, replyMsg]);
        
        // Mark ours as read
        setMessages(prev => prev.map(m => m.senderId === currentUserId ? { ...m, read: true } : m));
      }, 1500);
    }, 500);
  };

  const handleSendVoice = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUserId,
      senderName: 'Me',
      type: 'voice',
      content: url,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages([...messages, newMsg]);
    setActiveTool('none');
  };

  const handleSendImage = (file: File, caption: string) => {
    const url = URL.createObjectURL(file);
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUserId,
      senderName: 'Me',
      type: 'image',
      content: url,
      caption: caption,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages([...messages, newMsg]);
    setActiveTool('none');
  };

  const unreadCount = messages.filter(m => m.senderId !== currentUserId && !m.read).length;

  return (
    <div className="flex flex-col h-[600px] border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-light/30 text-brand flex items-center justify-center font-bold text-lg">
            {participantName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{participantName}</h3>
            {isTyping ? (
              <p className="text-xs text-brand font-medium animate-pulse">typing...</p>
            ) : (
              <p className="text-xs text-green-600 font-medium">Online</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-brand text-white text-xs font-bold rounded-full">
              {unreadCount} New
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => setActiveTool('call')} title="Start Video Call">
            📞
          </Button>
        </div>
      </div>

      {/* Main Area */}
      {activeTool === 'call' ? (
        <div className="flex-1 p-6 bg-gray-100 flex items-center justify-center overflow-y-auto">
          <CallInterface isConfigured={false} participantName={participantName} onClose={() => setActiveTool('none')} />
        </div>
      ) : (
        <>
          {/* Chat History */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe ? 'bg-brand text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                  }`}>
                    {msg.type === 'text' && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                    {msg.type === 'voice' && (
                      <audio src={msg.content} controls className={`h-10 ${isMe ? 'invert' : ''}`} />
                    )}
                    {msg.type === 'image' && (
                      <div className="space-y-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.content} alt={msg.caption || 'Image'} className="rounded-md max-h-64 object-contain" />
                        {msg.caption && <p className="text-sm">{msg.caption}</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <span className="text-[10px] text-gray-400">
                        {msg.read ? '• Read' : '• Sent'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Tools Area */}
          {activeTool === 'voice' && (
            <div className="p-4 bg-white border-t border-gray-200">
              <VoiceRecorder onSend={handleSendVoice} onCancel={() => setActiveTool('none')} />
            </div>
          )}

          {activeTool === 'image' && (
            <div className="p-4 bg-white border-t border-gray-200">
              <ImageUploader onSend={handleSendImage} onCancel={() => setActiveTool('none')} />
            </div>
          )}

          {/* Input Area */}
          {activeTool === 'none' && (
            <div className="p-3 bg-white border-t border-gray-200">
              <form onSubmit={handleSendText} className="flex items-center gap-2">
                <Button type="button" variant="outline" className="px-3" onClick={() => setActiveTool('image')} title="Send Image">
                  🖼️
                </Button>
                <Button type="button" variant="outline" className="px-3" onClick={() => setActiveTool('voice')} title="Send Voice Message">
                  🎤
                </Button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  aria-label="Type a message"
                  className="flex-1 px-4 py-2 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none text-sm transition-all"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <Button type="submit" variant="primary" disabled={!inputText.trim()} className="rounded-full px-5">
                  Send
                </Button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
