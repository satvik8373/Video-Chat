'use client';
import React, { useState, useEffect } from 'react';
import { getMeetingHistory, ParticipantData, MeetingData, MeetingHistory } from '@/lib/Meetinghistory';
import { cn } from '@/lib/utils';
import { parseISO, isValid, differenceInSeconds, format, differenceInMinutes } from 'date-fns';
import { useUser } from '@clerk/nextjs';

const getSafeDuration = (start: Date | string, end?: Date | string): string => {
  try {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    
    if (!isValid(startDate) || (end && !isValid(endDate))) {
      return '0m 0s';
    }

    const seconds = differenceInSeconds(endDate, startDate);
    return seconds > 0 
      ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
      : '0m 0s';
  } catch {
    return '0m 0s';
  }
};

const formatMeetingDate = (date: Date | string) => {
  try {
    const safeDate = date instanceof Date ? date : parseISO(date);
    return isValid(safeDate) 
      ? format(safeDate, "MMM dd, yyyy 'at' h:mm a") 
      : 'Date not available';
  } catch {
    return 'Date not available';
  }
};

const PreviousMeetings = () => {
  const { user } = useUser();
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingHistory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const meetingsPerPage = 9;

  const meetings = getMeetingHistory().sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const totalPages = Math.ceil(meetings.length / meetingsPerPage);

  const paginatedMeetings = meetings.slice(
    (currentPage - 1) * meetingsPerPage,
    currentPage * meetingsPerPage
  );

  // Add state to track viewed meetings
  const [viewedMeetings, setViewedMeetings] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('viewedMeetings');
    return new Set(saved ? JSON.parse(saved) : []);
  });

  // Mark meeting as viewed
  const markAsViewed = (meetingId: string) => {
    const updated = new Set(viewedMeetings).add(meetingId);
    setViewedMeetings(updated);
    localStorage.setItem('viewedMeetings', JSON.stringify(Array.from(updated)));
  };

  // Update the meeting card click handler
  const handleMeetingClick = (meeting: MeetingHistory) => {
    setSelectedMeeting(meeting);
    markAsViewed(meeting.id);
  };

  // Update the recent meeting check
  const isRecent = (meetingDate: Date) => {
    const now = new Date();
    return now.getTime() - new Date(meetingDate).getTime() < 24 * 60 * 60 * 1000;
  };

  // Add this near your meeting list header
  const totalParticipants = useState(0)[0];

  // Add this near your meeting list header
  const totalDuration = useState(0)[0];

  // Add state for selected meeting details
  const [selectedDetails, setSelectedDetails] = useState<MeetingData | null>(null);

  // Add modal component
  const MeetingDetailsModal = ({ meeting }: { meeting: MeetingData }) => {
    const start = meeting.startTime instanceof Date ? meeting.startTime : parseISO(meeting.startTime);
    const end = meeting.endTime instanceof Date ? meeting.endTime : parseISO(meeting.endTime);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background p-6 rounded-lg max-w-2xl w-full">
          <h2 className="text-2xl font-bold mb-4">{meeting.title}</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Meeting Time</h3>
              <p className="text-sm">
                {format(start, 'MMM dd, yyyy h:mm a')} - 
                {format(end, 'h:mm a')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Participants</h3>
              <p className="text-sm">{meeting.participants.length} attendees</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Meeting Creator</h3>
              <p className="text-sm">
                {meeting.createdBy === user?.id ? 'You' : meeting.createdBy}
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-2">Participant Details</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {meeting.participants
              .filter(p => 
                meeting.createdBy === user?.id || 
                p.userId === user?.id
              )
              .map((participant, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-dark-3 flex items-center justify-center">
                    <span className="text-xs">
                      {participant.userName[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {participant.userName}
                      {meeting.createdBy === participant.userId && (
                        <span className="ml-2 text-xs text-green-400">(Host)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      Joined: {new Date(participant.entryTime).toLocaleTimeString()}
                      {participant.leaveTime && 
                        ` - Left: ${new Date(participant.leaveTime).toLocaleTimeString()}`}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          <button
            onClick={() => setSelectedDetails(null)}
            className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90"
          >
            Close Details
          </button>
        </div>
      </div>
    );
  };

  const TotalDurationDisplay = ({ meeting }: { meeting: MeetingData }) => {
    const start = meeting.startTime instanceof Date ? meeting.startTime : parseISO(meeting.startTime);
    const end = meeting.endTime instanceof Date ? meeting.endTime : parseISO(meeting.endTime);

    if (!isValid(start) || !isValid(end)) {
      return (
        <div className="text-red-500 text-sm">
          Invalid time data • Please check meeting logs
        </div>
      );
    }

    const totalMinutes = differenceInMinutes(end, start);
    const formattedDuration = isNaN(totalMinutes) 
      ? 'Duration unavailable' 
      : `${totalMinutes} minutes`;

    return (
      <div className="duration-display text-sm">
        Total Duration: {formattedDuration}
      </div>
    );
  };

  return (
    <section className="flex size-full flex-col gap-10 text-white p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meeting Archive</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-dark-2 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="p-2">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-dark-2 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedMeetings.map((meeting) => {
          const recent = isRecent(meeting.date);
          const unviewed = recent && !viewedMeetings.has(meeting.id);
          
          return (
            <div
              key={meeting.id}
              onClick={() => handleMeetingClick(meeting)}
              className={cn(
                "p-6 rounded-xl bg-dark-1 hover:bg-dark-2 transition-all cursor-pointer group relative",
                recent && "ring-2 ring-blue-500"
              )}
            >
              {unviewed && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                  New
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold line-clamp-1">
                    {meeting.title}
                    {meeting.createdBy === user?.id && (
                      <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </h3>
                  <div className="time-details flex gap-2 items-center text-xs text-gray-400 mt-1">
                    <span>{formatMeetingDate(meeting.startTime)}</span>
                    <span>–</span>
                    <span>{meeting.endTime ? formatMeetingDate(meeting.endTime) : 'Now'}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{getSafeDuration(meeting.startTime, meeting.endTime)}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Participants:{" "}
                    {meeting.participants.slice(0, 3).map((p, i) => (
                      <span key={p.userId}>
                        {p.userName || 'Anonymous User'}
                        {i < meeting.participants.length - 1 ? ", " : ""}
                      </span>
                    ))}
                    {meeting.participants.length > 3 && (
                      <span className="text-blue-400 ml-1">
                        +{meeting.participants.length - 3} more
                      </span>
                    )}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  meeting.roomType === 'personal' ? 'bg-blue-500/20 text-blue-400' :
                  meeting.roomType === 'conference' ? 'bg-green-500/20 text-green-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {meeting.roomType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-400">Duration</p>
                  <p>{(meeting.duration / 1000 / 60).toFixed(1)} mins</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400">Participants</p>
                  <p>{meeting.totalParticipants}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400">Avg. Session</p>
                  <p>{(meeting.avgSessionDuration / 1000).toFixed(0)}s</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400">Meeting ID</p>
                  <p className="font-mono text-xs opacity-75">{meeting.id}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-1 rounded-xl p-6 max-w-4xl w-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedMeeting.title}</h2>
                <p className="text-gray-400 mt-2">
                  {new Date(selectedMeeting.date).toLocaleString()} • 
                  <span className="ml-2">
                    Total Duration: {(selectedMeeting.duration / 1000 / 60).toFixed(1)} minutes
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-gray-400 hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-dark-2">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Device</th>
                    <th className="text-left p-3">Network</th>
                    <th className="text-left p-3">Joined</th>
                    <th className="text-left p-3">Left</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMeeting.participants.map((participant, index) => {
                    const duration = getSafeDuration(
                      participant.entryTime,
                      participant.leaveTime
                    );

                    return (
                      <tr key={index} className="border-b border-dark-3 hover:bg-dark-2">
                        <td className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-dark-3 flex items-center justify-center">
                              <span className="text-xs">
                                {participant.userName[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{participant.userName}</p>
                              <p className="text-xs text-gray-400">
                                {participant.connectionType} • {participant.deviceType}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="capitalize">{participant.deviceType}</p>
                          <p className="text-xs text-gray-400">
                            {participant.connectionType}
                          </p>
                        </td>
                        <td className="p-3">
                          {format(new Date(participant.entryTime), 'HH:mm')}
                        </td>
                        <td className="p-3">
                          {participant.leaveTime ? format(new Date(participant.leaveTime), 'HH:mm') : 'Active'}
                        </td>
                        <td className="p-3">
                          <span className="ml-2 text-primary">({duration})</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* For total meeting duration */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold">
                Total Duration: {getSafeDuration(
                  selectedMeeting.startTime,
                  selectedMeeting.endTime
                )}
              </h3>
            </div>
          </div>
        </div>
      )}

      {selectedDetails && <MeetingDetailsModal meeting={selectedDetails} />}
    </section>
  );
};

export default PreviousMeetings; 