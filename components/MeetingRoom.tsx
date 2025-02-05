'use client';

import React, { useState, useEffect, useRef } from 'react';
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

// Define the types for the component props
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (numParticipants > 6) {
      setLayout('grid');
    } else if (adminCount > 1) {
      setLayout('split-screen');
    }
  }, [numParticipants, adminCount]);

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if (containerRef.current.mozRequestFullScreen) { // Firefox
          containerRef.current.mozRequestFullScreen();
        } else if (containerRef.current.webkitRequestFullscreen) { // Chrome, Safari
          containerRef.current.webkitRequestFullscreen();
        } else if (containerRef.current.msRequestFullscreen) { // IE/Edge
          containerRef.current.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout className="size-full m-0 p-0" />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" className="size-full m-0 p-0" />;
      case 'split-screen':
        return (
          <div className="grid grid-cols-2 gap-0 size-full m-0 p-0">
            <SpeakerLayout participantsBarPosition="left" className="size-full m-0 p-0" />
            <SpeakerLayout participantsBarPosition="right" className="size-full m-0 p-0" />
          </div>
        );
      default:
        return <SpeakerLayout participantsBarPosition="right" className="size-full m-0 p-0" />;
    }
  };

  return (
    <section ref={containerRef} className="relative size-full overflow-hidden text-white">
      <div className="flex size-full items-center justify-center">
        <div className="flex size-full max-w-full items-center">
          <CallLayout />
        </div>
        <div
          className={cn('size-full hidden ml-0', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push(`/`)} />
        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
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
          <div className="cursor-pointer rounded-2xl bg-[#19232d] hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
        <button onClick={toggleFullscreen}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] hover:bg-[#4c535b]">
            <Maximize2 size={20} className="text-white" />
          </div>
        </button>
      </div>
    </section>
  );
};

export default MeetingRoom;
