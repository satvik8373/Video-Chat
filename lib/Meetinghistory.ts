interface ParticipantData {
    userId: string;
    userName: string;
    entryTime: Date | string;
    leaveTime?: Date | string;
    deviceType: string;
    connectionType: string;
  }
  
  export interface MeetingData {
    id: string;
    title: string;
    participants: ParticipantData[];
    startTime: Date | string;
    endTime: Date | string;
    roomType: string;
    createdBy: string;
  }
  
  export const saveMeetingData = (
    meetingId: string,
    participants: ParticipantData[],
    roomType: string,
    title: string,
    createdById: string
  ) => {
    const history = getMeetingHistory();
    const existingMeeting = history.find(m => m.id === meetingId);

    const meetingData: MeetingData = {
      id: meetingId,
      title,
      participants: participants.map(p => ({
        ...p,
        entryTime: new Date(p.entryTime).toISOString(),
        leaveTime: p.leaveTime ? new Date(p.leaveTime).toISOString() : undefined
      })),
      startTime: participants[0]?.entryTime.toISOString(),
      endTime: new Date().toISOString(),
      roomType,
      createdBy: createdById
    };

    if (existingMeeting) {
      meetingData.createdBy = existingMeeting.createdBy;
      Object.assign(existingMeeting, meetingData);
    } else {
      history.unshift(meetingData);
    }

    localStorage.setItem('meetingHistory', JSON.stringify(history));
  };
  
  export const getMeetingHistory = (): MeetingData[] => {
    if (typeof window === 'undefined') return [];
    const history = localStorage.getItem('meetingHistory') || '[]';
    
    return JSON.parse(history, (key, value) => {
      if (typeof value === 'string' && !isNaN(Date.parse(value))) {
        return new Date(value);
      }
      return value;
    });
  };

  export const resetMeetingHistory = (): MeetingData[] => {
    localStorage.removeItem('meetingHistory');
    return [];
  };

  // Type definitions
  export interface MeetingData {
    meetingId: string;
    participants: ParticipantData[];
    roomType: string;
    meetingTitle: string;
    userId: string;
    startTime?: Date;
    endTime?: Date;
  }

  export interface MeetingHistory {
    meetings: MeetingData[];
  }