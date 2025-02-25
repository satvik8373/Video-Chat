'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { Loader2, PhoneOff } from 'lucide-react';
import { useState } from 'react';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();
  const [isEnding, setIsEnding] = useState(false);

  if (!call)
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    setIsEnding(true);
    try {
      await call.endCall();
      router.push('/');
    } catch (error) {
      console.error('Failed to end call', error);
      setIsEnding(false);
    }
  };

  return (
    <Button 
      onClick={endCall}
      disabled={isEnding}
      className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 active:from-red-700 active:to-rose-800 rounded-full px-6 py-5 shadow-lg hover:shadow-red-500/30 transition-all duration-200 group"
    >
      {isEnding ? (
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
      ) : (
        <PhoneOff className="w-5 h-5 mr-2 transform group-hover:scale-110 transition-transform" />
      )}
      <span className="font-semibold text-sm tracking-tight">
        {isEnding ? 'Ending...' : 'End call for everyone'}
      </span>
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
    </Button>
  );
};

export default EndCallButton;
