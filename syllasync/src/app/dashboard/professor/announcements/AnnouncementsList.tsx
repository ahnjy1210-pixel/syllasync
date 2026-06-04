"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock, CheckCircle2, FileText, Pencil, Trash2, Loader2, X, Save, Megaphone
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
  course: { name: string };
}

interface AnnouncementsListProps {
  initialAnnouncements: Announcement[];
  courses: { id: string; name: string }[];
}

export default function AnnouncementsList({ initialAnnouncements, courses }: AnnouncementsListProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAttachmentUrl, setEditAttachmentUrl] = useState("");
  const [editAttachmentName, setEditAttachmentName] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setEditTitle(ann.title);
    setEditContent(ann.content);
    setEditAttachmentUrl(ann.attachmentUrl || "");
    setEditAttachmentName(ann.attachmentName || "");
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditAttachmentUrl("");
    setEditAttachmentName("");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editTitle.trim() || !editContent.trim()) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/announcements/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          attachmentUrl: editAttachmentUrl.trim() || null,
          attachmentName: editAttachmentName.trim() || null,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === editingId
              ? {
                  ...a,
                  title: updated.title,
                  content: updated.content,
                  attachmentUrl: updated.attachmentUrl,
                  attachmentName: updated.attachmentName,
                }
              : a
          )
        );
        closeEdit();
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the announcement "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  if (announcements.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center">
        <Megaphone className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No announcements yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Edit Modal Overlay */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-st-dark flex items-center gap-2">
                <Pencil className="h-4 w-4 text-st-purple" />
                Edit Announcement
              </h2>
              <button
                onClick={closeEdit}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message</label>
                <textarea
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark resize-none"
                />
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="text-xs font-bold text-st-purple uppercase tracking-wider">Attached Document</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Name</label>
                    <input
                      type="text"
                      value={editAttachmentName}
                      onChange={(e) => setEditAttachmentName(e.target.value)}
                      placeholder="e.g. Syllabus PDF"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none text-xs text-st-dark"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">URL</label>
                    <input
                      type="url"
                      value={editAttachmentUrl}
                      onChange={(e) => setEditAttachmentUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none text-xs text-st-dark"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={editSaving || !editTitle.trim() || !editContent.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-st-purple hover:bg-st-indigo text-white text-sm font-bold transition-all disabled:opacity-60 cursor-pointer"
                >
                  {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="min-w-0">
                <span className="text-xs font-bold text-st-purple bg-st-purple/10 px-2 py-0.5 rounded-md mr-2">
                  {ann.course.name}
                </span>
                <h3 className="text-base font-bold text-st-dark mt-2 leading-snug">{ann.title}</h3>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(ann)}
                  title="Edit announcement"
                  className="p-1.5 rounded-lg hover:bg-st-purple/10 text-gray-400 hover:text-st-purple transition-all cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(ann.id, ann.title)}
                  disabled={deletingId === ann.id}
                  title="Delete announcement"
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50"
                >
                  {deletingId === ann.id
                    ? <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                    : <Trash2 className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-3">{ann.content}</p>

            {ann.attachmentUrl && (
              <div className="mb-4">
                <a
                  href={ann.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 hover:border-st-purple/30 text-st-purple hover:text-st-indigo rounded-xl text-xs font-semibold transition-all"
                >
                  <FileText className="h-4 w-4" />
                  {ann.attachmentName || "Attached Document"}
                </a>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                {new Date(ann.createdAt).toLocaleString()}
              </div>
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Sent
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
