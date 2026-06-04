"use client";

import { useState, useEffect } from "react";
import { Clock, FileText, Megaphone, MessageSquare, Download, Loader2 } from "lucide-react";
import CourseChat from "./CourseChat";

interface Lesson {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  room: string | null;
  notes: string | null;
  isCancelled: boolean;
}

interface Homework {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
}

interface Submission {
  id: string;
  homeworkId: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  grade: string | null;
  feedback: string | null;
  submittedAt: string;
}

interface StudentCourseTabsProps {
  courseId: string;
  currentUserId: string;
  currentUserName: string;
  lessons: Lesson[];
  homeworks: Homework[];
  announcements: Announcement[];
  initialSubmissions: Submission[];
}

export default function StudentCourseTabs({
  courseId,
  currentUserId,
  currentUserName,
  lessons,
  homeworks,
  announcements,
  initialSubmissions
}: StudentCourseTabsProps) {
  const [activeTab, setActiveTab] = useState<"schedule" | "homework" | "announcements" | "chat">("schedule");

  // Log announcement views when entering the announcements tab
  useEffect(() => {
    if (activeTab === "announcements" && announcements.length > 0) {
      announcements.forEach((ann) => {
        fetch(`/api/announcements/${ann.id}/view`, { method: "POST" }).catch((e) =>
          console.error("View log error", e)
        );
      });
    }
  }, [activeTab, announcements]);

  // Log chat read status when entering the chat tab
  useEffect(() => {
    if (activeTab === "chat") {
      fetch(`/api/courses/${courseId}/messages/read`, { method: "POST" }).catch((e) =>
        console.error("Read receipt chat error", e)
      );
    }
  }, [activeTab, courseId]);

  return (
    <div className="space-y-6">
      {/* Tabs List */}
      <div className="flex border-b border-neutral-800 bg-neutral-900 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "schedule"
              ? "bg-emerald-500 text-neutral-950 font-bold shadow-md"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
          }`}
        >
          <Clock className="h-4 w-4" />
          Schedule & Lessons
        </button>

        <button
          onClick={() => setActiveTab("homework")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "homework"
              ? "bg-emerald-500 text-neutral-950 font-bold shadow-md"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
          }`}
        >
          <FileText className="h-4 w-4" />
          Homework
        </button>

        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "announcements"
              ? "bg-emerald-500 text-neutral-950 font-bold shadow-md"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
          }`}
        >
          <Megaphone className="h-4 w-4" />
          Announcements
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "chat"
              ? "bg-emerald-500 text-neutral-950 font-bold shadow-md"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Course Chat
        </button>
      </div>

      {/* Tab Panels */}
      <div className="transition-all duration-250">
        {activeTab === "schedule" && (
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-neutral-100">
              <Clock className="h-5 w-5 text-indigo-400" />
              Class Schedule & Notes
            </h2>
            {lessons.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No lessons scheduled yet.</p>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex justify-between items-center p-5 border border-neutral-850 rounded-2xl bg-neutral-950/60 hover:bg-neutral-950 transition-colors">
                    <div>
                      <h4 className={`font-bold ${lesson.isCancelled ? "text-neutral-550 line-through" : "text-neutral-200"}`}>
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-1.5 flex items-center gap-2">
                        <span>{new Date(lesson.startTime).toLocaleString()}</span>
                        {lesson.room && <span>•</span>}
                        {lesson.room && <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">{lesson.room}</span>}
                      </p>
                      {lesson.notes && (
                        <p className="text-sm text-neutral-400 mt-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl leading-relaxed">
                          {lesson.notes}
                        </p>
                      )}
                    </div>
                    {lesson.isCancelled && (
                      <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                        Cancelled
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "homework" && (
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-neutral-100">
              <FileText className="h-5 w-5 text-orange-400" />
              Homework & Assignments
            </h2>
            {homeworks.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No homework assigned yet.</p>
            ) : (
              <div className="space-y-6">
                {homeworks.map((hw) => {
                  const submission = initialSubmissions.find((s) => s.homeworkId === hw.id);
                  return (
                    <StudentHomeworkItem
                      key={hw.id}
                      hw={hw}
                      submission={submission}
                      courseId={courseId}
                    />
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "announcements" && (
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-neutral-100">
              <Megaphone className="h-5 w-5 text-emerald-400" />
              Course Announcements
            </h2>
            {announcements.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No announcements posted yet.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-5 border border-neutral-850 rounded-2xl bg-neutral-950/60 hover:bg-neutral-950 transition-colors">
                    <h4 className="font-bold text-neutral-200 mb-2">{ann.title}</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">{ann.content}</p>
                    
                    {ann.attachmentUrl && (
                      <div className="mb-4">
                        <a
                          href={ann.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 hover:border-emerald-500/35 text-emerald-450 hover:text-emerald-300 rounded-xl text-xs font-semibold transition-all"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {ann.attachmentName || "Attached Document"}
                        </a>
                      </div>
                    )}
                    
                    <span className="text-[10px] text-neutral-500 block">
                      Posted: {new Date(ann.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "chat" && (
          <section>
            <CourseChat
              courseId={courseId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserRole="STUDENT"
            />
          </section>
        )}
      </div>
    </div>
  );
}

function StudentHomeworkItem({
  hw,
  submission: initialSub,
  courseId
}: {
  hw: Homework;
  submission: Submission | undefined;
  courseId: string;
}) {
  const [sub, setSub] = useState<Submission | undefined>(initialSub);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialSub?.content || "");
  const [fileUrl, setFileUrl] = useState(initialSub?.fileUrl || "");
  const [fileName, setFileName] = useState(initialSub?.fileName || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !fileUrl.trim()) {
      return alert("Please enter text content or attach a link/document URL.");
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/homework/${hw.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim() || null,
          fileUrl: fileUrl.trim() || null,
          fileName: fileName.trim() || null
        })
      });
      if (res.ok) {
        const newSub = await res.json();
        setSub(newSub);
        setIsEditing(false);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to submit homework");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const isDueSoon = new Date(hw.dueDate).getTime() - Date.now() < 48 * 60 * 60 * 1000;

  return (
    <div className="p-6 border border-neutral-850 rounded-2xl bg-neutral-950/60 space-y-4 hover:border-neutral-800 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h4 className="font-bold text-neutral-200 text-base">{hw.title}</h4>
          {hw.description && (
            <p className="text-sm text-neutral-450 mt-1.5 whitespace-pre-line leading-relaxed">{hw.description}</p>
          )}
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
          isDueSoon ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
        }`}>
          Due: {new Date(hw.dueDate).toLocaleString()}
        </span>
      </div>

      {sub ? (
        <div className="border-t border-neutral-850/65 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-450 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              Submitted on {new Date(sub.submittedAt).toLocaleString()}
            </span>
            {!sub.grade && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
              >
                Edit Submission
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-4 space-y-3">
              {sub.content && (
                <div className="text-sm text-neutral-300 whitespace-pre-line leading-relaxed">
                  {sub.content}
                </div>
              )}
              {sub.fileUrl && (
                <div>
                  <a
                    href={sub.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {sub.fileName || "View Attachment"}
                  </a>
                </div>
              )}

              {/* Grading section */}
              {(sub.grade || sub.feedback) && (
                <div className="mt-2 pt-3 border-t border-neutral-850/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Grade:</span>
                    <span className="text-sm font-black text-emerald-450 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/25">
                      {sub.grade || "Ungraded"}
                    </span>
                  </div>
                  {sub.feedback && (
                    <div className="text-xs text-neutral-400 bg-neutral-950 p-3 rounded-lg border border-neutral-850">
                      <span className="font-bold text-neutral-500 block mb-1">Professor Feedback:</span>
                      {sub.feedback}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-850 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center mb-1">
                <h5 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Edit Submission</h5>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-neutral-455 hover:text-neutral-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-550 uppercase">Text Submission</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your submission text or response here..."
                  rows={4}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-neutral-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-550 uppercase">Attachment URL / Link</label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-neutral-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-550 uppercase">Attachment Name</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g. Essay Draft PDF"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-neutral-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Submission
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border-t border-neutral-850/65 pt-4 space-y-4">
          <h5 className="text-xs font-bold text-neutral-450 uppercase tracking-wider">Submit Assignment</h5>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-550 uppercase">Text Submission</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your submission text or response here..."
              rows={3}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-850 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-neutral-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-550 uppercase">Attachment URL / Link (Optional)</label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-850 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-neutral-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-550 uppercase">Attachment Name</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Essay Draft PDF"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-850 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-neutral-200"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Submit Homework
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
