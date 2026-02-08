'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscript, onError, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      onError('Voice input requires Chrome browser. Please use Chrome or enter text manually.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true; // Keep listening until manually stopped
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let fullTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        fullTranscript += final;
      }

      setInterimText(fullTranscript + interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // In continuous mode, no-speech is normal - just keep listening
        return;
      } else if (event.error === 'aborted') {
        // User stopped, not an error
      } else {
        onError(`Speech recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      // Send the final transcript when recording ends
      if (fullTranscript.trim()) {
        onTranscript(fullTranscript.trim());
        fullTranscript = '';
      }
      setInterimText('');
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onTranscript, onError]);

  const toggleRecording = () => {
    if (disabled) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg text-sm text-center max-w-md">
          <p className="font-medium mb-1">Voice input not supported</p>
          <p>Please use Chrome browser for voice recording</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={toggleRecording}
        disabled={disabled}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg",
          isRecording
            ? "bg-red-500 animate-pulse"
            : "bg-primary hover:bg-primary/90",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <MicOff className="w-12 h-12 text-white" />
        ) : (
          <Mic className="w-12 h-12 text-white" />
        )}
      </button>

      <div className="text-sm text-center min-h-6 max-w-md">
        {isRecording ? (
          <div>
            <p className="text-red-500 font-medium mb-2">Recording... Click to stop</p>
            {interimText && (
              <p className="text-muted-foreground italic">
                {interimText}
              </p>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">
            Click to speak (will record until you click again)
          </span>
        )}
      </div>
    </div>
  );
}
