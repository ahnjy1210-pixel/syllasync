"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Bell } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  link: string | null;
}

export default function NotificationsList({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const markAsRead = async (id: string) => {
    // Optimistically update the UI
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
        <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-450 text-sm">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => !n.isRead && markAsRead(n.id)}
          className={`bg-white rounded-2xl border p-5 transition-all relative overflow-hidden ${
            n.isRead
              ? "border-gray-100 opacity-80"
              : "border-st-purple/20 shadow-sm bg-st-purple/[0.01] hover:bg-st-purple/[0.03] cursor-pointer"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              n.isRead ? "bg-gray-150 text-gray-400" : "bg-st-lime text-st-indigo"
            }`}>
              {n.isRead ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-bold mb-0.5 ${n.isRead ? "text-gray-650" : "text-st-dark"}`}>
                {n.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{n.body}</p>
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-gray-400 font-semibold">{new Date(n.createdAt).toLocaleString()}</span>
                {n.link && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!n.isRead) markAsRead(n.id);
                      router.push(n.link!);
                    }}
                    className="text-xs font-bold text-st-purple hover:underline cursor-pointer"
                  >
                    View Details &rarr;
                  </span>
                )}
              </div>
            </div>
            {!n.isRead && (
              <span className="w-2.5 h-2.5 rounded-full bg-st-purple shrink-0 mt-1.5" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
