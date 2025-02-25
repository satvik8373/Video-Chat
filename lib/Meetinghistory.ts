interface userData {
    userId: string;
    userName: string;
    entryTime: Date | string;
    leaveTime?: Date | string;
    deviceType: string;
    connectionType: string;
  }
  
  export interface MeetingData {
    meetingId: string;
    participants: userData[];
    roomType: string;
    meetingTitle: string;
    userId: string;
    startTime?: Date;
    endTime?: Date;
  }
  
  export const saveMeetingData = (
    meetingId: string,
    participants: userData[],
    roomType: string,
    meetingTitle: string,
    userId: string
  ) => {
    console.log('Saving meeting data:', { meetingId, participants, roomType, meetingTitle, userId });
    // Add your logic to save the data here
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
    participants: userData[];
    roomType: string;
    meetingTitle: string;
    userId: string;
    startTime?: Date;
    endTime?: Date;
  }

  export interface MeetingHistory {
    meetings: MeetingData[];
  }