/* eslint-disable camelcase */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import Loader from './Loader';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { useToast } from './ui/use-toast';
import { Input } from './ui/input';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | 'isJoiningMeetingByCode' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const [meetingCode, setMeetingCode] = useState('AC-87463');
  const client = useStreamVideoClient();
  const { user } = useUser();
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetail(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({
        title: 'Meeting Created',
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };

  const joinViaCode = () => {
    if (!meetingCode) {
      toast({ title: 'Please enter a code' });
      return;
    }
    router.push(`/meeting/${meetingCode}`);
  };

  if (!client || !user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState('isInstantMeeting')}
        className="bg-gradient-to-br from-blue-600 to-purple-600 hover:shadow-blue-500/30"
        iconClass="h-8 w-8 text-cyan-300"
        hoverEffect="hover:scale-105 transition-transform"
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link or code"
        className="bg-gradient-to-br from-green-600 to-cyan-600 hover:shadow-green-500/30"
        handleClick={() => setMeetingState('isJoiningMeeting')}
        iconClass="h-8 w-8 text-emerald-300"
        hoverEffect="hover:scale-105 transition-transform"
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        className="bg-gradient-to-br from-purple-600 to-pink-600 hover:shadow-purple-500/30"
        handleClick={() => setMeetingState('isScheduleMeeting')}
        iconClass="h-8 w-8 text-fuchsia-300"
        hoverEffect="hover:scale-105 transition-transform"
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Meeting Recordings"
        className="bg-gradient-to-br from-orange-600 to-amber-600 hover:shadow-orange-500/30"
        handleClick={() => router.push('/recordings')}
        iconClass="h-8 w-8 text-amber-300"
        hoverEffect="hover:scale-105 transition-transform"
      />

      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
          overlayClass="backdrop-blur-xl bg-black/80"
          contentClass="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50"
        >
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              <h3 className="text-lg font-semibold">Meeting Details</h3>
              <p className="text-sm">Add description and schedule time</p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-cyan-400">Description</label>
                <Textarea
                  className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  onChange={(e) => setValues({ ...values, description: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-cyan-400">Date & Time</label>
                <ReactDatePicker
                  selected={values.dateTime}
                  onChange={(date) => setValues({ ...values, dateTime: date! })}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-3 backdrop-blur-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  wrapperClassName="w-full"
                />
              </div>
            </div>
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: 'Link Copied' });
          }}
          image={'/icons/checked.svg'}
          buttonIcon="/icons/copy.svg"
          className="text-center"
          buttonText="Copy Meeting Link"
          imageClass="animate-pulse h-24 w-24"
          titleClass="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent"
          buttonClass="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
        />
      )}

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Join Meeting"
        className="text-center"
        buttonText="Join Now"
        handleClick={() => router.push(values.link)}
        contentClass="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50"
        titleClass="text-cyan-400"
      >
        <div className="space-y-4">
          <Input
            placeholder="Paste meeting link here"
            onChange={(e) => setValues({ ...values, link: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 backdrop-blur-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
          />
          <div className="text-sm text-slate-400">
            Make sure you have the correct meeting link from the host
          </div>
        </div>
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeetingByCode'}
        onClose={() => setMeetingState(undefined)}
        title="Join via Code"
        className="text-center"
        buttonText="Join Now"
        handleClick={joinViaCode}
        contentClass="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50"
        titleClass="text-cyan-400"
      >
        <div className="space-y-4">
          <Input
            placeholder="Enter meeting code (e.g. AC-87463)"
            onChange={(e) => setMeetingCode(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 backdrop-blur-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
          />
          <div className="text-sm text-slate-400">
            Enter the code provided by the meeting host
          </div>
        </div>
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start Instant Meeting"
        className="text-center"
        buttonText="Begin Now"
        handleClick={createMeeting}
        buttonClass="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
        contentClass="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50"
        titleClass="text-purple-400"
      >
        <div className="space-y-2 text-center">
          <p className="text-slate-300">Starting a new instant meeting</p>
          <div className="h-1 w-20 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-pink-400 mx-auto" />
        </div>
      </MeetingModal>
    </section>
  );
};

export default MeetingTypeList;
