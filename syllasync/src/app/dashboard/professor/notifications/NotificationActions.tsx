"use client";

import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NotificationActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications", { method: "PUT" });
      router.refresh();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <button
      onClick={markAllRead}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-bold text-st-purple hover:bg-st-purple/5 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
    >
      <CheckCheck className="h-4 w-4" />
      Mark all as read
    </button>
  );
}
