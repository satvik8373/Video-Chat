import { getMeetingHistory } from '@/lib/Meetinghistory'; // Corrected casing
import formatMeetingDate from '@/components/PreviousMeetings'; // Changed to default import
import getSafeDuration from '@/components/PreviousMeetings'; // Changed to default import

const UpcomingPage = () => {
  const upcomingMeetings = getMeetingHistory().filter(meeting => 
    new Date(meeting.startTime) > new Date() && 
    meeting.roomType === 'scheduled' &&
    !meeting.endTime
  );

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Upcoming Meetings</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {upcomingMeetings.map((meeting) => (
          <div 
            key={meeting.id}
            className="rounded-lg bg-slate-800/50 p-6 backdrop-blur-sm border border-slate-700/50"
          >
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">{meeting.title}</h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-300">
                <span className="font-medium">Starts:</span> {formatMeetingDate(meeting.startTime)}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-medium">Duration:</span> {getSafeDuration(meeting.startTime, meeting.endTime)}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-medium">Participants:</span> {meeting.participants.length}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-medium">Created by:</span> {meeting.createdBy}
              </p>
            </div>
          </div>
        ))}
      </div>
      {upcomingMeetings.length === 0 && (
        <p className="text-center text-slate-400 mt-8">No upcoming meetings scheduled</p>
      )}
    </section>
  );
};

export default UpcomingPage;
