"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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

/**
 * Types used for local state
 * These mirror the expected JSON structures returned by the API.
 */
type PendingDeal = {
  id: string;
  title: string;
  ebitda: number;
  status: string;
};

type ScreenerNotification = {
  id: string;
  title: string;
  status: string;
};

/**
 * The WebSocket message schema.
 * Each message type triggers different updates in the UI.
 */
type WebSocketMessage =
  | { type: "new_screen_call"; userId: string }
  | {
      type: "problem_done";
      userId: string;
      productId: string;
      status: string;
      productName?: string;
    }
  | { type: "job_update"; jobId: string; status: string; result?: string };

/**
 * NotificationPopover
 *
 * This component:
 *  - Displays a bell icon with live notification count
 *  - Shows deals and screener updates in a popover
 *  - Connects to a WebSocket server for real-time updates
 *  - Syncs with /api/notifications (for persisted data)
 *  - Reconnects automatically if the socket drops
 */
const NotificationPopover = ({ userId }: { userId: string }) => {
  // --- STATE ---
  const [open, setOpen] = useState(false);
  const [deals, setDeals] = useState<PendingDeal[]>([]);
  const [screeners, setScreeners] = useState<ScreenerNotification[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [isPending, startTransition] = useTransition();

  // --- WEBSOCKET CONTROL ---
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryDelayRef = useRef(1000); // grows exponentially up to 10s

  /**
   * Fetches all pending deals.
   * Called when the popover opens or when a WebSocket update is received.
   */
  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch("/api/deals/pending");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: PendingDeal[] = await res.json();
      setDeals(data);
    } catch (error) {
      console.error("❌ Error fetching deals:", error);
    }
  }, []);

  /**
   * Fetches the latest screener notifications.
   * Matches the structure returned by your `/api/notifications` route.
   */
  const fetchScreeners = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data: ScreenerNotification[] = await res.json(); // ✅ route returns array directly
      setScreeners(data);
    } catch (err) {
      console.error("❌ Error fetching screeners:", err);
    }
  }, []);

  /**
   * Triggers both API fetches concurrently within a React transition.
   * This ensures smoother UI updates (no blocking re-renders).
   */
  const fetchAndTransition = useCallback(() => {
    startTransition(() => {
      fetchDeals();
      fetchScreeners();
    });
  }, [fetchDeals, fetchScreeners]);

  /**
   * When the popover opens, refresh both data sets.
   */
  useEffect(() => {
    if (open) fetchAndTransition();
  }, [open, fetchAndTransition]);

  /**
   * Utility: format EBITDA values to human-readable currency strings.
   */
  const formatEbitda = (ebitda: number) => {
    if (ebitda >= 1_000_000) return `$${(ebitda / 1_000_000).toFixed(1)}M`;
    if (ebitda >= 1_000) return `$${(ebitda / 1_000).toFixed(1)}K`;
    return `$${ebitda.toLocaleString()}`;
  };

  // --- REAL-TIME CONNECTION (WebSocket) ---
  const connectWebSocket = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080";
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      ws.send(JSON.stringify({ type: "register", userId })); // identify this client
      retryDelayRef.current = 1000;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (e) => {
      try {
        const msg: WebSocketMessage = JSON.parse(e.data);

        // Different message types can trigger different refreshes
        if (msg.type === "new_screen_call") fetchAndTransition();
        if (msg.type === "problem_done" && msg.productId) fetchAndTransition();
      } catch {
        /* ignore malformed messages */
      }
    };

    /**
     * Handle reconnect logic with exponential backoff.
     * Prevents flooding the server when connection drops.
     */
    const scheduleReconnect = () => {
      if (reconnectTimeoutRef.current) return;
      const delay = Math.min(retryDelayRef.current, 10000);
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connectWebSocket();
      }, delay);
      retryDelayRef.current = Math.min(delay * 2, 10000);
    };

    ws.onclose = () => {
      setWsConnected(false);
      scheduleReconnect();
    };

    ws.onerror = () => {
      setWsConnected(false);
      scheduleReconnect();
    };
  }, [userId, fetchAndTransition]);

  /**
   * Initialize WebSocket connection when the component mounts.
   * Clean up on unmount.
   */
  useEffect(() => {
    if (!userId) return;
    connectWebSocket();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      retryDelayRef.current = 1000;
    };
  }, [userId, connectWebSocket]);

  /**
   * Refresh notifications whenever the window regains focus.
   * Keeps UI up to date even if WebSocket missed some messages.
   */
  useEffect(() => {
    const onFocus = () => fetchAndTransition();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchAndTransition]);

  const totalNotifications = deals.length + screeners.length;

  // --- RENDER ---
  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        {/* --- TRIGGER BUTTON --- */}
        <PopoverTrigger asChild>
          <button className="relative rounded-full p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <BellIcon className="size-5 text-foreground" />
            {totalNotifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full p-0 text-xs font-medium"
              >
                {totalNotifications > 99 ? "99+" : totalNotifications}
              </Badge>
            )}
            {/* WebSocket connection indicator */}
            <div
              className={cn(
                "absolute -bottom-0 -right-0 size-2 rounded-full",
                wsConnected ? "bg-green-500" : "bg-red-500"
              )}
            />
          </button>
        </PopoverTrigger>

        {/* --- POPOVER CONTENT --- */}
        <PopoverContent className="w-80 p-0" align="end">
          {/* Header */}
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <h5 className="flex items-center gap-2 font-semibold text-foreground">
                <FileText className="size-4" />
                Notifications
              </h5>
              {totalNotifications > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {totalNotifications} pending
                </Badge>
              )}
            </div>
          </div>

          {/* Scrollable list of notifications */}
          <ScrollArea className="h-[300px] px-4">
            {/* Loading state */}
            {isPending && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                  <span className="text-sm">Loading notifications...</span>
                </div>
              </div>
            )}

            {/* Connection lost state */}
            {!wsConnected && !isPending && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 size-12 rounded-full bg-red-100 p-2 dark:bg-red-900/20">
                  <div className="size-8 rounded-full bg-red-500" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Connection lost
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Attempting to reconnect...
                </p>
              </div>
            )}

            {/* Empty state */}
            {totalNotifications === 0 && !isPending && wsConnected && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-3 size-12 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  No notifications
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Your notifications will appear here
                </p>
              </div>
            )}

            {/* --- DEAL NOTIFICATIONS --- */}
            {deals.length > 0 && !isPending && (
              <div className="space-y-2 py-2">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="group relative cursor-pointer rounded-lg border p-3 hover:border-ring hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h5 className="truncate text-sm font-medium">
                          {deal.title || `Deal #${deal.id}`}
                        </h5>
                        <p className="mt-1 text-xs text-muted-foreground">
                          ID: {deal.id}
                        </p>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <TrendingUp className="size-3" />
                          <span className="font-medium">
                            {formatEbitda(deal.ebitda)}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs",
                            deal.status === "Pending" &&
                              "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-300"
                          )}
                        >
                          {deal.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* --- SCREENER NOTIFICATIONS --- */}
            {screeners.length > 0 && !isPending && (
              <div className="space-y-2 py-2 border-t pt-2">
                {screeners.map((s) => (
                  <div
                    key={s.id}
                    className="group relative cursor-pointer rounded-lg border p-3 hover:bg-accent/50"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="truncate text-sm font-medium">{s.title}</h5>
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        {s.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer: Link to full notifications page */}
          <div className="border-t px-4 py-2">
            <Link
              href="/notifications"
              className="inline-block w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              onClick={() => setOpen(false)}
            >
              View All Notifications
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NotificationPopover;
