import { MeetingData, ParticipantData } from './Meetinghistory';

export const getMeetingVisibility = (
  meeting: MeetingData,
  currentUserId?: string
) => {
  const isAdmin = meeting.createdBy === currentUserId;
  const isParticipant = meeting.participants.some(p => p.userId === currentUserId);
  
  return {
    canSeeAllParticipants: isAdmin,
    canSeePersonalData: isAdmin || isParticipant,
    canSeeTimestamps: isAdmin
  };
}; 