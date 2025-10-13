"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { BellIcon, Clock, TrendingUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import React, {
  useEffect,
  useState,
  useTransition,
  useCallback,
  useRef,
} from "react";
import { ScrollArea } from "./ui/scroll-area";

const NotificationPopover = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="relative rounded-full p-2 transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <BellIcon className="size-5 text-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <h5 className="flex items-center gap-2 font-semibold text-foreground">
                <FileText className="size-4" />
                Your Deals Queue
              </h5>
            </div>
          </div>

          <ScrollArea className="h-[300px] px-4"></ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NotificationPopover;
