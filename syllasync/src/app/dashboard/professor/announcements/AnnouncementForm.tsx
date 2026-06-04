"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Course { id: string; name: string; }

export default function AnnouncementForm({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return alert("Please select a course");
    setLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          courseId, 
          title, 
          content, 
          attachmentUrl: attachmentUrl.trim() || null, 
          attachmentName: attachmentName.trim() || null 
        }),
      });
      if (res.ok) {
        setTitle(""); setContent(""); setCourseId("");
        setAttachmentUrl(""); setAttachmentName("");
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to send");
      }
    } catch { alert("Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Course</label>
        <select
          required
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark"
        >
          <option value="">Select a course…</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Class cancelled this Friday"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message</label>
        <textarea
          required
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your message here…"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark placeholder:text-gray-400 resize-none"
        />
      </div>

      <div className="border-t border-gray-100 pt-3 mt-1">
        <div className="text-xs font-bold text-st-purple uppercase tracking-wider mb-2">Attach Document (Optional)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Document Name</label>
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="e.g. Syllabus PDF"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-xs text-st-dark placeholder:text-gray-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Document URL</label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="e.g. https://example.com/syllabus.pdf"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-xs text-st-dark placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-st-purple hover:bg-st-indigo text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_20px_rgba(59,7,100,0.2)] disabled:opacity-60 cursor-pointer"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? "Sending…" : "Send to All Students"}
      </button>
    </form>
  );
}
