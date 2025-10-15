"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type ScreenerNotification = {
  id: string;
  title: string;
  status: string;
};

type WebSocketMessage =
  | { type: "new_screen_call"; userId: string }
  | {
      type: "problem_done";
      userId: string;
      productId: string;
      status: string;
      productName?: string;
    }
  | { type: "job_update"; jobId: string; status?: string; result?: string };

const NotificationsPage = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState<ScreenerNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryDelayRef = useRef(1000);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data: ScreenerNotification[] = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!userId) return;

    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080";
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      ws.send(JSON.stringify({ type: "register", userId }));
      retryDelayRef.current = 1000;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (e) => {
      try {
        const msg: WebSocketMessage = JSON.parse(e.data);
        if (msg.type === "new_screen_call" || (msg.type === "problem_done" && msg.productId)) {
          fetchNotifications();
        }
      } catch {
        // ignore parsing errors
      }
    };

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
  }, [userId, fetchNotifications]);

  useEffect(() => {
    fetchNotifications(); // initial fetch
    connectWebSocket();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      retryDelayRef.current = 1000;
    };
  }, [connectWebSocket, fetchNotifications]);

  useEffect(() => {
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchNotifications]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
        <FileText className="size-6" />
        Notifications
      </h1>

      {!wsConnected && (
        <div className="mb-4 flex items-center gap-2 text-red-600 text-sm">
          ⚠ Connection lost. Attempting to reconnect...
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
            <span>Loading notifications...</span>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="mb-3 size-12 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            No notifications
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Any new notifications will appear here
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[600px] border border-border rounded-md px-4 py-2">
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="group flex items-center justify-between rounded-lg border border-border p-3 hover:border-ring hover:bg-accent/50"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="truncate text-sm font-medium text-foreground">
                    {n.title}
                  </h5>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-2 py-0.5 text-xs",
                      n.status === "Pending" &&
                        "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-300"
                    )}
                  >
                    {n.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default NotificationsPage;
