"use client";

import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import Image from 'next/image';

import { useGetCallById } from "@/hooks/useGetCallById";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Table = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-start gap-2 xl:flex-row w-full p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 hover:border-cyan-400/30 transition-all group">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        <h1 className="text-base font-medium text-cyan-400 lg:text-xl xl:min-w-32">
          {title}:
        </h1>
      </div>
      <h1 className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
        {description}
      </h1>
    </div>
  );
};

const PersonalRoom = () => {
  const router = useRouter();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const { toast } = useToast();

  const meetingId = user?.id;

  const { call } = useGetCallById(meetingId!);

  const startRoom = async () => {
    if (!client || !user) return;

    const newCall = client.call("default", meetingId!);

    if (!call) {
      await newCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
        },
      });
    }

    router.push(`/meeting/${meetingId}?personal=true`);
  };

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`;

  return (
    <section className="flex size-full flex-col gap-10 text-white p-8 bg-gradient-to-br from-slate-900 to-slate-800">
      <h1 className="text-3xl font-bold lg:text-5xl text-white">
        Personal Meeting Room
      </h1>
      <div className="flex w-full flex-col gap-6 xl:max-w-[900px]">
        <Table 
          title="Topic" 
          description={`${user?.username}'s Meeting Room`} 
          titleClass="text-blue-400"
          descriptionClass="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
        />
        <Table 
          title="Meeting ID" 
          description={meetingId!} 
          titleClass="text-green-400"
          descriptionClass="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent"
        />
        <Table 
          title="Invite Link" 
          description={meetingLink} 
          titleClass="text-pink-400"
          descriptionClass="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent"
        />
      </div>
      <div className="flex gap-5 animate-slideUp">
        <Button
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-6 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-blue-500/30"
          onClick={startRoom}
        >
          <span className="flex items-center gap-2 text-xl">
            <Image src="/icons/play.svg" alt="play" width={20} height={20} />
            Start Meeting
          </span>
        </Button>
        <Button
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-purple-500/30"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <Image src="/icons/checked.svg" alt="check" width={24} height={24} />
                  Link Copied!
                </div>
              ),
            });
          }}
        >
          <span className="flex items-center gap-2 text-xl">
            <Image src="/icons/copy.svg" alt="copy" width={20} height={20} />
            Copy Invitation
          </span>
        </Button>
      </div>
    </section>
  );
};

export default PersonalRoom;
