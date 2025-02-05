"use client";
import { useState, useEffect, ReactNode } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import Image from "next/image";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  instantMeeting?: boolean;
  image?: string;
  buttonClassName?: string;
  buttonIcon?: string;
  numParticipants?: number;
  adminCount?: number;
  layoutPreference?: string;
  screenSize?: string;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  image,
  buttonClassName,
  buttonIcon,
  numParticipants = 1,
  adminCount = 0,
  layoutPreference = "grid",
  screenSize = "medium",
}: MeetingModalProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable full-screen mode:", err);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "flex w-full max-w-[1024px] flex-col gap-6 border-none bg-dark-1 px-6 py-9 text-white",
          isFullScreen ? "w-screen h-screen max-w-none" : ""
        )}
      >
        <div className="flex flex-col gap-6 items-center text-center w-full h-full">
          {image && (
            <div className="flex justify-center">
              <Image src={image} alt="checked" width={72} height={72} />
            </div>
          )}
          <h1 className={cn("text-3xl font-bold leading-[42px]", className)}>
            {title}
          </h1>
          <div className="w-full flex-grow flex items-center justify-center">
            {children}
          </div>
          <div className="flex flex-wrap gap-4 justify-center w-full">
            <Button
              className={cn(
                "bg-blue-1 focus-visible:ring-0 focus-visible:ring-offset-0",
                buttonClassName
              )}
              onClick={handleClick}
            >
              {buttonIcon && (
                <Image
                  src={buttonIcon}
                  alt="button icon"
                  width={13}
                  height={13}
                />
              )} 
              &nbsp;
              {buttonText || "Schedule Meeting"}
            </Button>
            <Button
              className="bg-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? "Exit Full Screen" : "Full Screen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
