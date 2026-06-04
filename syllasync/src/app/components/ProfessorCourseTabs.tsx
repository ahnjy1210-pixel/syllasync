"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock, FileText, Megaphone, MessageSquare, Users, Plus, Download,
  Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, UserCheck, Eye, EyeOff
} from "lucide-react";
import CourseChat from "./CourseChat";
import CourseRoster from "./CourseRoster";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  room: string;
  notes: string;
  isCancelled: boolean;
}

interface Homework {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
}

interface Enrollment {
  id: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Submission {
  id: string;
  homeworkId: string;
  studentId: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  grade: string | null;
  feedback: string | null;
  submittedAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
  views: {
    userId: string;
    userName: string;
    viewedAt: string;
  }[];
}

interface ProfessorCourseTabsProps {
  courseId: string;
  courseName: string;
  currentUserId: string;
  currentUserName: string;
  lessons: Lesson[];
  homeworks: Homework[];
  enrollments: Enrollment[];
  announcements: Announcement[];
  initialSubmissions: Submission[];
}

export default function ProfessorCourseTabs({
  courseId,
  courseName,
  currentUserId,
  currentUserName,
  lessons,
  homeworks,
  enrollments,
  announcements,
  initialSubmissions
}: ProfessorCourseTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"lessons" | "announcements" | "grading" | "roster">("lessons");
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [expandedHwId, setExpandedHwId] = useState<string | null>(null);

  // Read receipts helper for announcements
  const [showAnnReceiptsId, setShowAnnReceiptsId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Tabs List */}
      <div className="flex border-b border-gray-100 bg-white p-1.5 rounded-2xl gap-1 shadow-sm">
        <button
          onClick={() => setActiveTab("lessons")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "lessons"
              ? "bg-st-purple text-white font-bold shadow-md"
              : "text-gray-500 hover:text-st-dark hover:bg-gray-50"
          }`}
        >
          <Clock className="h-4 w-4" />
          Lessons & Chat
        </button>

        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "announcements"
              ? "bg-st-purple text-white font-bold shadow-md"
              : "text-gray-500 hover:text-st-dark hover:bg-gray-50"
          }`}
        >
          <Megaphone className="h-4 w-4" />
          Announcements
        </button>

        <button
          onClick={() => setActiveTab("grading")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "grading"
              ? "bg-st-purple text-white font-bold shadow-md"
              : "text-gray-500 hover:text-st-dark hover:bg-gray-50"
          }`}
        >
          <FileText className="h-4 w-4" />
          Grading Tracker
        </button>

        <button
          onClick={() => setActiveTab("roster")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "roster"
              ? "bg-st-purple text-white font-bold shadow-md"
              : "text-gray-500 hover:text-st-dark hover:bg-gray-50"
          }`}
        >
          <Users className="h-4 w-4" />
          Student Roster
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "lessons" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-st-dark">
                  <Clock className="h-5 w-5 text-st-purple" />
                  Schedule & Lessons
                </h2>
                <Link
                  href={`/dashboard/professor/course/${courseId}/lessons`}
                  className="flex items-center gap-2 bg-st-purple hover:bg-st-indigo text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Add Lesson
                </Link>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                {lessons.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No lessons scheduled yet.</p>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                        <div>
                          <h4 className={`font-bold ${lesson.isCancelled ? "text-gray-450 line-through" : "text-st-dark"}`}>
                            {lesson.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(lesson.startTime).toLocaleString()} - {lesson.room || "TBA"}
                          </p>
                          {lesson.notes && <p className="text-xs text-gray-400 mt-2 bg-white p-2 border border-gray-100 rounded-lg">{lesson.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.isCancelled && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                              Cancelled
                            </span>
                          )}
                          <Link
                            href={`/dashboard/professor/course/${courseId}/lessons`}
                            className="text-xs font-bold text-st-indigo px-3 py-1.5 bg-st-lime rounded-lg hover:brightness-95 transition-all"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Sidebar */}
            <div className="lg:col-span-1">
              <CourseChat
                courseId={courseId}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                currentUserRole="PROFESSOR"
                totalStudentsCount={enrollments.length}
                enrolledStudentNames={enrollments.map((e) => ({ id: e.userId, name: e.user.name }))}
              />
            </div>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-st-dark">
                <Megaphone className="h-5 w-5 text-st-purple" />
                Course Announcements
              </h2>
              <Link
                href="/dashboard/professor/announcements"
                className="flex items-center gap-2 bg-st-purple hover:bg-st-indigo text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Create Announcement
              </Link>
            </div>

            {announcements.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No announcements posted yet.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => {
                  const seenIds = new Set(ann.views.map((v) => v.userId));
                  const unseenStudents = enrollments.filter((e) => !seenIds.has(e.userId));
                  const isPopupOpen = showAnnReceiptsId === ann.id;

                  return (
                    <div key={ann.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all relative">
                      <h4 className="font-bold text-st-dark mb-1 text-base">{ann.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">{ann.content}</p>

                      {ann.attachmentUrl && (
                        <div className="mb-4">
                          <a
                            href={ann.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:border-st-purple/35 text-st-purple hover:text-st-indigo rounded-xl text-xs font-semibold transition-all"
                          >
                            <Download className="h-3.5 w-3.5" />
                            {ann.attachmentName || "Attached Document"}
                          </a>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100/50">
                        <span className="text-[10px] text-gray-400 font-semibold">
                          Posted: {new Date(ann.createdAt).toLocaleString()}
                        </span>

                        {/* Read Receipts Stats */}
                        <div className="relative">
                          <button
                            onClick={() => setShowAnnReceiptsId(isPopupOpen ? null : ann.id)}
                            className="flex items-center gap-1.5 text-xs text-st-purple hover:text-st-indigo font-bold bg-st-purple/5 hover:bg-st-purple/10 px-3 py-1 rounded-full transition-all cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Seen by {ann.views.length}/{enrollments.length}</span>
                          </button>

                          {isPopupOpen && (
                            <div className="absolute right-0 bottom-8 z-30 bg-white border border-gray-150 rounded-2xl shadow-xl p-4 w-72 space-y-3 text-left">
                              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                <span className="text-xs font-bold text-st-dark">Read Receipts</span>
                                <button
                                  onClick={() => setShowAnnReceiptsId(null)}
                                  className="text-[10px] font-bold text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  Close
                                </button>
                              </div>

                              <div className="max-h-48 overflow-y-auto space-y-2">
                                <div>
                                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-1">Viewed ({ann.views.length})</div>
                                  {ann.views.length === 0 ? (
                                    <div className="text-[10px] text-gray-400 italic">No students have viewed yet.</div>
                                  ) : (
                                    <div className="space-y-1">
                                      {ann.views.map((v) => (
                                        <div key={v.userId} className="text-[11px] text-gray-700 flex justify-between">
                                          <span className="font-medium">{v.userName}</span>
                                          <span className="text-[9px] text-gray-400">{new Date(v.viewedAt).toLocaleDateString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-gray-50">
                                  <div className="text-[10px] font-bold text-red-500 uppercase tracking-wide mb-1">Unread ({unseenStudents.length})</div>
                                  {unseenStudents.length === 0 ? (
                                    <div className="text-[10px] text-gray-400 italic">Everyone has viewed!</div>
                                  ) : (
                                    <div className="space-y-0.5">
                                      {unseenStudents.map((e) => (
                                        <div key={e.userId} className="text-[11px] text-gray-600 font-medium">
                                          {e.user.name}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "grading" && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-st-dark mb-4">
              <FileText className="h-5 w-5 text-st-purple" />
              Homework Submissions & Grading
            </h2>

            {homeworks.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No homework has been posted for this course.</p>
            ) : (
              <div className="space-y-4">
                {homeworks.map((hw) => {
                  const hwSubmissions = submissions.filter((s) => s.homeworkId === hw.id);
                  const isExpanded = expandedHwId === hw.id;

                  return (
                    <div key={hw.id} className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                      {/* Accordion Trigger */}
                      <button
                        onClick={() => setExpandedHwId(isExpanded ? null : hw.id)}
                        className="w-full flex items-center justify-between p-5 bg-gray-50/70 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div>
                          <h4 className="font-bold text-st-dark text-base">{hw.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            Due: {new Date(hw.dueDate).toLocaleString()} • Submitted: {hwSubmissions.length}/{enrollments.length}
                          </p>
                        </div>
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                      </button>

                      {/* Submissions Panel */}
                      {isExpanded && (
                        <div className="p-5 border-t border-gray-100 bg-white space-y-6">
                          <h5 className="text-xs font-bold text-st-purple uppercase tracking-wider mb-2">Student Submissions Log</h5>
                          {enrollments.length === 0 ? (
                            <div className="text-center text-gray-400 py-4 text-sm">No students enrolled to submit.</div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {enrollments.map((student) => {
                                const sub = hwSubmissions.find((s) => s.studentId === student.userId);
                                return (
                                  <GradingRow
                                    key={student.userId}
                                    courseId={courseId}
                                    homeworkId={hw.id}
                                    studentId={student.userId}
                                    studentName={student.user.name}
                                    studentEmail={student.user.email}
                                    submission={sub}
                                    onGradeSave={(updatedSub) => {
                                      setSubmissions((prev) => {
                                        const filtered = prev.filter(
                                          (s) => !(s.homeworkId === hw.id && s.studentId === student.userId)
                                        );
                                        return [...filtered, updatedSub];
                                      });
                                    }}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "roster" && (
          <CourseRoster
            courseId={courseId}
            courseName={courseName}
            initialEnrollments={enrollments}
          />
        )}
      </div>
    </div>
  );
}

function GradingRow({
  courseId,
  homeworkId,
  studentId,
  studentName,
  studentEmail,
  submission,
  onGradeSave
}: {
  courseId: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submission: Submission | undefined;
  onGradeSave: (sub: Submission) => void;
}) {
  const [gradeInput, setGradeInput] = useState(submission?.grade || "");
  const [feedbackInput, setFeedbackInput] = useState(submission?.feedback || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/courses/${courseId}/homework/${homeworkId}/submissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          grade: gradeInput,
          feedback: feedbackInput
        })
      });

      if (res.ok) {
        const updated = await res.json();
        onGradeSave(updated);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Failed to save grade");
      }
    } catch {
      setErrorMsg("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row gap-6 justify-between">
      {/* Student Profile & Submission Info */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-st-purple/10 flex items-center justify-center font-bold text-st-purple text-xs">
            {studentName.charAt(0)}
          </div>
          <div>
            <h6 className="text-sm font-bold text-st-dark">{studentName}</h6>
            <p className="text-[10px] text-gray-400">{studentEmail}</p>
          </div>
          <div className="ml-2">
            {submission ? (
              submission.grade ? (
                <span className="text-[10px] font-black uppercase text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                  Graded: {submission.grade}
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded">
                  Needs Grading
                </span>
              )
            ) : (
              <span className="text-[10px] font-bold uppercase text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                Missing
              </span>
            )}
          </div>
        </div>

        {submission ? (
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
            {submission.content && (
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{submission.content}</p>
            )}
            {submission.fileUrl && (
              <div>
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-st-purple hover:text-st-indigo rounded-lg text-[11px] font-semibold transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  {submission.fileName || "Download Document"}
                </a>
              </div>
            )}
            <span className="text-[9px] text-gray-400 block">Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic pl-12">No submission turned in yet.</div>
        )}
      </div>

      {/* Grade and Feedback Inputs */}
      <form onSubmit={handleSaveGrade} className="w-full md:w-80 bg-gray-50/50 p-4 border border-gray-100 rounded-2xl space-y-3 shrink-0">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1 space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Grade</label>
            <input
              type="text"
              placeholder="e.g. A, 95"
              value={gradeInput}
              onChange={(e) => setGradeInput(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-250 rounded-lg text-xs outline-none focus:border-st-purple text-st-dark"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Feedback</label>
            <textarea
              placeholder="Optional notes"
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              rows={1}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-250 rounded-lg text-xs outline-none focus:border-st-purple text-st-dark resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            {success && (
              <span className="text-[10px] font-semibold text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Saved!
              </span>
            )}
            {errorMsg && (
              <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Error
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-3.5 py-1.5 bg-st-purple hover:bg-st-indigo text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
            Grade
          </button>
        </div>
      </form>
    </div>
  );
}
