'use client';
import { useState, useEffect } from 'react';
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
import { Users, LayoutList, Share, ChevronRight, MessageSquare } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { saveMeetingData } from '@/lib/Meetinghistory';
import MeetingChat from './MeetingChat';
import EndCallButton from './EndCallButton'; // Ensure this import exists

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

interface UserData {
  userId: string;
  userName: string;
  entryTime: Date;
  leaveTime?: Date;
  deviceType: string;
  connectionType: string;
}

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { useCallCallingState } = useCallStateHooks();
  const meetingId = searchParams.get('id') || crypto.randomUUID();
  const roomType = isPersonalRoom ? 'personal' : 'conference';
  const meetingTitle = searchParams.get('title') || 'Untitled Meeting';
  const [userData, setUserData] = useState<UserData[]>([]);
  const { user } = useUser();
  const callingState = useCallCallingState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const logUserEntry = () => {
    const existingEntry = userData.find((p) => p.userId === user?.id && !p.leaveTime);
    if (existingEntry) return;

    const newUserData: UserData = {
      userId: user?.id || 'unknown',
      userName: user?.fullName || user?.username || 'Anonymous',
      entryTime: new Date(),
      deviceType: navigator.userAgent.match(/mobile/i) ? 'mobile' : 'desktop',
      connectionType: 'web',
    };
    setUserData((prev) => [...prev, newUserData]);
  };

  const logUserLeave = (index: number) => {
    setUserData((prev) => {
      const updatedUsers = [...prev];
      if (index >= 0 && index < updatedUsers.length) {
        updatedUsers[index].leaveTime = new Date();
      }
      return updatedUsers;
    });
  };

  useEffect(() => {
    logUserEntry();
    return () => {
      logUserLeave(userData.length - 1);
    };
  }, []);

  useEffect(() => {
    if (isPersonalRoom) {
      setIsAdmin(true);
    }
  }, [isPersonalRoom]);

  const handleSaveMeetingData = () => {
    if (isAdmin) {
      saveMeetingData(meetingId, userData, roomType, meetingTitle, user?.id || 'unknown');
    } else {
      const userIndex = userData.findIndex((p) => p.userId === user?.id);
      if (userIndex !== -1) {
        saveMeetingData(meetingId, [userData[userIndex]], roomType, meetingTitle, user?.id || 'unknown');
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      handleSaveMeetingData();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      handleSaveMeetingData();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userData, meetingId, roomType, meetingTitle, user, isAdmin]);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Meeting link copied to clipboard!');
  };

  const handleShareEmail = (provider: string) => {
    const subject = encodeURIComponent('Join My Meeting');
    const body = encodeURIComponent(`Join the meeting: ${window.location.href}`);
    const urls: Record<string, string> = {
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
      outlook: `https://outlook.office.com/mail/deeplink/compose?subject=${subject}&body=${body}`,
      yahoo: `https://compose.mail.yahoo.com/?subject=${subject}&body=${body}`,
      default: `mailto:?subject=${subject}&body=${body}`,
    };
    window.open(urls[provider] || urls.default, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className={`relative h-screen w-full overflow-hidden pt-4 ${isDarkMode ? 'bg-dark-1 text-white' : 'bg-white text-black'}`}>
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div className={cn('h-[calc(100vh-86px)] hidden ml-2', { 'show-block': showParticipants })}>
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
        <MeetingChat
          meetingId={meetingId}
          meetingTitle={meetingTitle}
          user={user}
          isDarkMode={isDarkMode}
          showChat={showChat}
          setShowChat={setShowChat}
        />
      </div>

      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls
          onLeave={() => {
            if (isPersonalRoom) {
              saveMeetingData(
                meetingId,
                userData.map((p) => ({ ...p, leaveTime: p.leaveTime || new Date() })),
                roomType,
                meetingTitle,
                user?.id || 'unknown'
              );
            } else {
              const userIndex = userData.findIndex((p) => p.userId === user?.id);
              if (userIndex !== -1) {
                saveMeetingData(
                  meetingId,
                  [{ ...userData[userIndex], leaveTime: new Date() }],
                  roomType,
                  meetingTitle,
                  user?.id || 'unknown'
                );
              }
            }
            router.push('/');
          }}
        />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger
              className={`cursor-pointer rounded-2xl ${isDarkMode ? 'bg-[#19232d] hover:bg-[#4c535b]' : 'bg-gray-100 hover:bg-gray-200'} px-4 py-2`}
            >
              <LayoutList size={20} className={isDarkMode ? 'text-white' : 'text-black'} />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className={`border-dark-1 ${isDarkMode ? 'bg-dark-1 text-white' : 'bg-white text-black'}`}>
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item) => (
              <div key={item}>
                <DropdownMenuItem onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}>
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className={isDarkMode ? 'border-dark-1' : 'border-gray-200'} />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger
              className={`cursor-pointer rounded-2xl ${isDarkMode ? 'bg-[#19232d] hover:bg-[#4c535b]' : 'bg-gray-100 hover:bg-gray-200'} px-4 py-2`}
            >
              <Share size={20} className={isDarkMode ? 'text-white' : 'text-black'} />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className={`border-dark-1 ${isDarkMode ? 'bg-dark-1 text-white' : 'bg-white text-black'}`}>
            <DropdownMenuItem onClick={handleCopyLink}>Copy Link</DropdownMenuItem>
            <DropdownMenuSeparator className={isDarkMode ? 'border-dark-1' : 'border-gray-200'} />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center justify-between">
                Share via Email
                <ChevronRight className={`ml-2 ${isDarkMode ? 'text-white' : 'text-black'}`} size={16} />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className={`border-dark-1 ${isDarkMode ? 'bg-dark-1 text-white' : 'bg-white text-black'}`}>
                {['gmail', 'outlook', 'yahoo', 'default'].map((provider) => (
                  <DropdownMenuItem key={provider} onClick={() => handleShareEmail(provider)}>
                    {provider.charAt(0).toUpperCase() + provider.slice(1).replace('default', 'Other Client')}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className={`cursor-pointer rounded-2xl ${isDarkMode ? 'bg-[#19232d] hover:bg-[#4c535b]' : 'bg-gray-100 hover:bg-gray-200'} px-4 py-2`}>
            <Users size={20} className={isDarkMode ? 'text-white' : 'text-black'} />
          </div>
        </button>
        <button onClick={() => setShowChat((prev) => !prev)}>
          <div className={`cursor-pointer rounded-2xl ${isDarkMode ? 'bg-[#19232d] hover:bg-[#4c535b]' : 'bg-gray-100 hover:bg-gray-200'} px-4 py-2`}>
            <MessageSquare size={20} className={isDarkMode ? 'text-white' : 'text-black'} />
          </div>
        </button>
        {!isPersonalRoom && (
          <EndCallButton
          
          />
        )}
      </div>

      <div>
        <h2>User Data</h2>
        <ul>
          {userData.map((user, index) => (
            <li key={index}>
              Entry Time: {user.entryTime.toLocaleTimeString()} - Leave Time:{' '}
              {user.leaveTime ? user.leaveTime.toLocaleTimeString() : 'Still in room'} - Time Spent:{' '}
              {user.leaveTime ? ((user.leaveTime.getTime() - user.entryTime.getTime()) / 1000).toFixed(0) + ' seconds' : 'N/A'}
            </li>
          ))}
        </ul>
      </div>

      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`rounded-full p-3 transition-colors duration-300 ${
            isDarkMode ? 'bg-black border border-white/20 hover:bg-white/10' : 'bg-white border border-black/20 hover:bg-black/10'
          }`}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
      </div>
    </section>
  );
};

export default MeetingRoom;