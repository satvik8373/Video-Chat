'use client';
import { useEffect, useState } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import Alert from './Alert';
import { Button } from './ui/button';
import { MicOff, VideoOff, Video, Mic, ChevronRight } from 'lucide-react';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;
  const call = useCall();
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isHoverJoin, setIsHoverJoin] = useState(false);

  useEffect(() => {
    if (isMicMuted) {
      call.microphone.disable();
    } else {
      call.microphone.enable();
    }
  }, [isMicMuted, call.microphone]);

  useEffect(() => {
    if (isCameraOff) {
      call.camera.disable();
    } else {
      call.camera.enable();
    }
  }, [isCameraOff, call.camera]);

  if (!call) throw new Error('useStreamCall must be used within a StreamCall component.');

  if (callTimeNotArrived) return <Alert title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`} />;
  if (callHasEnded) return <Alert title="The call has been ended by the host" iconUrl="/icons/call-ended.svg" />;

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-blue-500/20"
            style={{ 
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%'
            }}
          />
        ))}
      </div>

      <div className="relative flex w-full max-w-40xl flex-col items-center gap-8 rounded-3xl bg-slate-800/50 p-12 shadow-2xl backdrop-blur-xl">
        <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
          Meeting Prelude
        </h1>

        <div className="relative h-70">
          <VideoPreview className="h-full w-full object-cover" />
          <div className="absolute inset-0 border-[3px] border-transparent [mask:linear-gradient(white,white)_padding-box,linear-gradient(white,white)_border-box]">
            <div className="absolute inset-0 h-full w-full animate-rotate bg-[conic-gradient(var(--tw-gradient-stops))] from-transparent via-transparent via-30% to-blue-500 opacity-20" />
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-6 px-8">
          <div className="flex items-center gap-6">
            {/* Microphone Toggle */}
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`relative flex h-12 w-16 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ${
                  isMicMuted ? 'bg-blue-500/30' : 'bg-slate-700/50'
                }`}
                onClick={() => setIsMicMuted(!isMicMuted)}
              >
                <div
                  className={`absolute flex h-10 w-10 items-center justify-center rounded-full shadow-md ${
                    isMicMuted ? 'bg-blue-500 translate-x-[24px]' : 'bg-slate-600'
                  } transition-transform duration-300`}
                >
                  {isMicMuted ? (
                    <MicOff className="h-5 w-5 text-white" />
                  ) : (
                    <Mic className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-slate-300">
                {isMicMuted ? 'Mic Muted' : 'Mic On'}
              </span>
            </div>

            {/* Camera Toggle */}
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`relative flex h-12 w-16 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ${
                  isCameraOff ? 'bg-blue-500/30' : 'bg-slate-700/50'
                }`}
                onClick={() => setIsCameraOff(!isCameraOff)}
              >
                <div
                  className={`absolute flex h-10 w-10 items-center justify-center rounded-full shadow-md ${
                    isCameraOff ? 'bg-blue-500 translate-x-[24px]' : 'bg-slate-600'
                  } transition-transform duration-300`}
                >
                  {isCameraOff ? (
                    <VideoOff className="h-5 w-5 text-white" />
                  ) : (
                    <Video className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-slate-300">
                {isCameraOff ? 'Camera Off' : 'Camera On'}
              </span>
            </div>
          </div>

          <DeviceSettings>
            <Button variant="ghost" className="rounded-xl bg-slate-700/40 p-6 hover:bg-slate-700/60">
              <ChevronRight className="mr-2 h-5 w-5 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Advanced Settings
              </span>
            </Button>
          </DeviceSettings>
        </div>

        <div
          onMouseEnter={() => setIsHoverJoin(true)}
          onMouseLeave={() => setIsHoverJoin(false)}
        >
          <Button
            className="relative h-16 w-64 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-xl font-bold shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30"
            onClick={() => {
              call.join();
              setIsSetupComplete(true);
            }}
          >
            {isHoverJoin && (
              <div className="absolute inset-0 rounded-2xl bg-white/10 transition-opacity duration-300" />
            )}
            <span className="drop-shadow-md">Join Meeting</span>
            <div className="absolute -right-4 -top-4">
              <div className="h-8 w-8 animate-pulse rounded-full bg-blue-400/30" />
              <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-blue-400/20" />
            </div>
          </Button>
        </div>
      </div>

      {/* Floating particles overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-white/10"
            style={{
              x: Math.random() * 100 + 'vw',
              y: Math.random() * 100 + 'vh',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MeetingSetup;
