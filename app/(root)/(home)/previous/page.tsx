import React, { useState } from 'react';
import PreviousMeetings from '@/components/PreviousMeetings';
import { useUser } from '@clerk/nextjs';
import { parseISO, isValid, differenceInSeconds, format, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';

const PreviousMeetingsPage = () => {
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingHistory | null>(null);

  return (
    <div>
      <PreviousMeetings />
    </div>
  );
};

export default PreviousMeetingsPage;
