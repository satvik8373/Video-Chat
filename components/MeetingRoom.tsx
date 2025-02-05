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
import { Users, LayoutList, Maximize2 } from 'lucide-react';

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

const layouts = ['grid', 'speaker-left', 'speaker-right', 'split-screen'];

interface MeetingRoomProps {
  numParticipants: number;
  adminCount: number;
  layoutPreference: string;
  screenSize: string;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({
  numParticipants,
  adminCount,
  layoutPreference,
  screenSize,
}) => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState(layoutPreference || 'grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const meetingRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen logic
  const enterFullscreen = () => {
    if (meetingRef.current) {
      if (meetingRef.current.requestFullscreen) {
        meetingRef.current.requestFullscreen();
      } else if (meetingRef.current.mozRequestFullScreen) {
        meetingRef.current.mozRequestFullScreen();
      } else if (meetingRef.current.webkitRequestFullscreen) {
        meetingRef.current.webkitRequestFullscreen();
      } else if (meetingRef.current.msRequestFullscreen) {
        meetingRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        setIsFullscreen(true);
      } else {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    if (numParticipants > 6) {
      setLayout('grid');
    } else if (adminCount > 1) {
      setLayout('split-screen');
    }

    if (window.navigator.standalone) {
      enterFullscreen();
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [numParticipants, adminCount]);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout className="h-full w-full m-0 p-0" />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" className="h-full w-full m-0 p-0" />;
      case 'split-screen':
        return (
          <div className="grid grid-cols-2 gap-0 h-full w-full m-0 p-0">
            <SpeakerLayout participantsBarPosition="left" className="h-full w-full m-0 p-0" />
            <SpeakerLayout participantsBarPosition="right" className="h-full w-full m-0 p-0" />
          </div>
        );
      default:
        return <SpeakerLayout participantsBarPosition="right" className="h-full w-full m-0 p-0" />;
    }
  };

  return (
    <section className="relative h-screen w-screen overflow-hidden text-white m-0 p-0" ref={meetingRef}>
      <div className="relative flex size-full items-center justify-center m-0 p-0">
        <div className="flex size-full max-w-full items-center m-0 p-0">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-0', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 m-0 p-0">
        <CallControls onLeave={() => router.push(`/`)} />
        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] hover:bg-[#4c535b] m-0 p-0">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white m-0 p-0">
            {layouts.map((item, index) => (
              <div key={index}>
                <DropdownMenuItem onClick={() => setLayout(item)}>
                  {item.replace('-', ' ')}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] hover:bg-[#4c535b] m-0 p-0">
            <Users size={20} className="text-white" />
          </div>
        </button>
        <button onClick={toggleFullscreen} className="cursor-pointer rounded-2xl bg-[#19232d] hover:bg-[#4c535b] m-0 p-0">
          <Maximize2 size={20} className="text-white" />
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
