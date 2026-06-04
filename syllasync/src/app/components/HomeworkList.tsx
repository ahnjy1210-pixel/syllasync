"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Clock, FileText, Pencil, Trash2, Loader2, X, Save, AlertTriangle
} from "lucide-react";

interface Homework {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  courseId: string;
  course: { name: string };
  createdAt?: string;
}

interface HomeworkListProps {
  initialHomeworks: Homework[];
  showCourseBadge?: boolean;
}

export default function HomeworkList({ initialHomeworks, showCourseBadge = true }: HomeworkListProps) {
  const router = useRouter();
  const [homeworks, setHomeworks] = useState<Homework[]>(initialHomeworks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = (hw: Homework) => {
    setEditingId(hw.id);
    setEditTitle(hw.title);
    setEditDescription(hw.description || "");
    // Convert to local ISO format for datetime-local input (YYYY-MM-DDTHH:MM)
    const dateObj = new Date(hw.dueDate);
    const localISO = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEditDueDate(localISO);
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditDueDate("");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editTitle.trim() || !editDueDate) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/homework/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          dueDate: new Date(editDueDate).toISOString(),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setHomeworks((prev) =>
          prev.map((h) =>
            h.id === editingId
              ? {
                  ...h,
                  title: updated.title,
                  description: updated.description,
                  dueDate: updated.dueDate,
                }
              : h
          )
        );
        closeEdit();
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update homework");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the assignment "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/homework/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHomeworks((prev) => prev.filter((h) => h.id !== id));
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete homework");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  if (homeworks.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center">
        <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No assignments posted yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Edit Modal Overlay */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-st-dark flex items-center gap-2">
                <Pencil className="h-4 w-4 text-st-purple" />
                Edit Assignment
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
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assignment Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Instructions & Description</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date & Time</label>
                <input
                  type="datetime-local"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark"
                />
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
                  disabled={editSaving || !editTitle.trim() || !editDueDate}
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

      {/* Homework List */}
      <div className="space-y-4">
        {homeworks.map((hw) => (
          <div
            key={hw.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="min-w-0">
                {showCourseBadge && (
                  <span className="text-xs font-bold text-st-purple bg-st-purple/10 px-2 py-0.5 rounded-md mr-2">
                    {hw.course.name}
                  </span>
                )}
                <h3 className="text-base font-bold text-st-dark mt-2 leading-snug">{hw.title}</h3>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(hw)}
                  title="Edit assignment"
                  className="p-1.5 rounded-lg hover:bg-st-purple/10 text-gray-400 hover:text-st-purple transition-all cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(hw.id, hw.title)}
                  disabled={deletingId === hw.id}
                  title="Delete assignment"
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50"
                >
                  {deletingId === hw.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {hw.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-3 whitespace-pre-line">{hw.description}</p>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full font-semibold">
                <Clock className="h-3.5 w-3.5" />
                Due: {new Date(hw.dueDate).toLocaleString()}
              </div>
              <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                <Calendar className="h-3 w-3" />
                Posted {new Date(hw.createdAt || "").toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
