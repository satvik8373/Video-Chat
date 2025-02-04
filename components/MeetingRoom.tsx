'use client';
import { useState, useEffect } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Maximize, Minimize } from 'lucide-react';

import Loader from './Loader';
import EndCallButton from './EndCallButton';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [showParticipants, setShowParticipants] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  return (
    <section className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Full-screen Video Layout */}
      <div className="absolute inset-0 flex items-center justify-center">
        <PaginatedGridLayout />
      </div>

      {/* Participants Sidebar (Hidden Until Toggled) */}
      {showParticipants && (
        <div className="absolute right-0 top-0 h-full w-72 bg-[#19232d] shadow-lg">
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      )}

      {/* Bottom Fixed Call Controls */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-5 p-4 bg-black/50">
        <CallControls onLeave={() => router.push(`/`)} />
        <CallStatsButton />

        {/* Fullscreen Toggle Button */}
        <button onClick={toggleFullscreen}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            {isFullscreen ? (
              <Minimize size={20} className="text-white" />
            ) : (
              <Maximize size={20} className="text-white" />
            )}
          </div>
        </button>

        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
