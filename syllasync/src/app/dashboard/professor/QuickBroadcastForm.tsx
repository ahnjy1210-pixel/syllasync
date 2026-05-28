"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  name: string;
}

export default function QuickBroadcastForm({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return alert("Please select a course");
    if (!content.trim()) return;

    setLoading(true);
    setSuccess(false);

    try {
      // Use the course name as title prefix or general Title
      const courseName = courses.find(c => c.id === courseId)?.name || "Course Announcement";
      const title = `Announcement for ${courseName}`;

      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, title, content }),
      });

      if (res.ok) {
        setContent("");
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to send broadcast");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
      <select
        required
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-st-lime"
      >
        <option value="" className="text-gray-900">Select Course</option>
        {courses.map(c => (
          <option key={c.id} value={c.id} className="text-gray-900">{c.name}</option>
        ))}
      </select>

      <textarea 
        required
        rows={3} 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message here..." 
        className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-st-lime placeholder:text-white/40 resize-none text-white"
      />

      <button
        type="submit"
        disabled={loading || !courseId || !content.trim()}
        className="w-full bg-st-lime disabled:opacity-60 text-st-indigo font-bold py-2.5 rounded-xl hover:brightness-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-800" />
            Broadcast Sent!
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Now
          </>
        )}
      </button>
    </form>
  );
}
