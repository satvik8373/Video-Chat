'use client';
import { useState, useEffect, useRef } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, Maximize, Minimize } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!(searchParams.get('personal') ?? '');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  // Handle Full-Screen Toggle
  const toggleFullScreen = () => {
    const element = document.documentElement;
    if (!document.fullscreenElement && element.requestFullscreen) {
      element.requestFullscreen();
      setIsFullScreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Swipe Gesture Detection for Mobile (Show/Hide Controls)
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const diff = touchStartX - touchEndX;
      if (diff > 50) {
        // Swipe Left → Show Controls
        setShowControls(true);
      } else if (diff < -50) {
        // Swipe Right → Hide Controls
        setShowControls(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full w-full items-center">
          <CallLayout />
        </div>

        {/* Participants List Panel */}
        <div
          className={cn('absolute top-0 right-0 h-full w-[80%] bg-black transition-transform duration-300', {
            'translate-x-0': showParticipants,
            'translate-x-full': !showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Swipe Gesture Navigation for Mobile Controls */}
      <div
        ref={controlsRef}
        className={cn(
          'fixed bottom-0 flex w-full items-center justify-center gap-3 bg-black/80 p-3 transition-transform duration-300',
          {
            'translate-y-0': showControls,
            'translate-y-full': !showControls,
          }
        )}
      >
        <CallControls onLeave={() => router.push(`/`)} />

        {/* Layout Change Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <LayoutList size={20} className="text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Call Stats Button */}
        <CallStatsButton />

        {/* Toggle Participants Panel */}
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>

        {/* Full-Screen Toggle Button */}
        <button onClick={toggleFullScreen}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            {isFullScreen ? (
              <Minimize size={20} className="text-white" />
            ) : (
              <Maximize size={20} className="text-white" />
            )}
          </div>
        </button>

        {/* End Call Button (if not a personal room) */}
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
