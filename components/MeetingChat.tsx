'use client';
import { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { cn } from '@/lib/utils';

type MeetingChatProps = {
  meetingId: string;
  meetingTitle: string;
  user: any;
  isDarkMode: boolean;
  showChat: boolean;
  setShowChat: (value: boolean) => void;
};

const MeetingChat = ({ meetingId, meetingTitle, user, isDarkMode, showChat, setShowChat }: MeetingChatProps) => {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStreamToken = async (userId: string) => {
    try {
      const response = await fetch('/api/stream-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      console.log('Token fetch response:', response.status, response.statusText);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch token');
      console.log(`Token fetched for user ${userId}:`, data.token.substring(0, 10) + '...'); // Log first 10 chars for security
      return data.token;
    } catch (err: any) {
      setError('Failed to authenticate with Stream Chat');
      console.error('Token fetch error:', err);
      return null;
    }
  };

  useEffect(() => {
    const initChat = async () => {
      if (!user || !process.env.NEXT_PUBLIC_STREAM_API_KEY) {
        setError('Missing user or Stream API key');
        return;
      }

      const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY);
      const token = await fetchStreamToken(user.id);
      if (!token) return;

      try {
        await client.connectUser(
          {
            id: user.id,
            name: user.fullName || user.username || 'Anonymous',
            image: user.imageUrl || undefined,
          },
          token
        );
        console.log(`User ${user.id} connected successfully`);

        const chatChannel = client.channel('messaging', meetingId, { name: meetingTitle });
        await chatChannel.watch();
        const members = chatChannel.state.members ? Object.keys(chatChannel.state.members) : [];
        if (!members.includes(user.id)) {
          await chatChannel.addMembers([user.id]);
          console.log(`Added user ${user.id} to channel ${meetingId}`);
        }
        setChatClient(client);
      } catch (err) {
        setError('Failed to initialize chat');
        console.error('Chat initialization error:', err);
      }
    };

    if (showChat) initChat(); // Only init when chat is shown

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
        console.log(`Disconnected user ${user?.id}`);
      }
    };
  }, [user, meetingId, meetingTitle, showChat]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!chatClient ) return null; // Don’t show loading when hidden

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-96 bg-opacity-90 transition-transform duration-300 ease-in-out z-50',
        isDarkMode ? 'bg-dark-2 chat-dark' : 'bg-gray-100 chat-light',
        { 'translate-x-0': showChat, 'translate-x-full': !showChat }
      )}
    >
      <Chat client={chatClient} theme={isDarkMode ? 'messaging dark' : 'messaging light'}>
        <Channel>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput
              additionalTextareaProps={{
                placeholder: 'Type your message here...',
                className: 'min-h-[50px] resize-none',
              }}
              focus
          
            />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
};
  
export default MeetingChat;