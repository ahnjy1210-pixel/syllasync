"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, UserPlus, Search, Trash2, Loader2, CheckCircle2, Mail, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Enrollment {
  id: string;
  createdAt: string;
  user: Student;
}

interface CourseRosterProps {
  courseId: string;
  courseName: string;
  initialEnrollments: Enrollment[];
}

export default function CourseRoster({ courseId, courseName, initialEnrollments }: CourseRosterProps) {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" }); // type can be "success" or "error"

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setEnrolling(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`/api/courses/${courseId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        setEnrollments([data.enrollment, ...enrollments]);
        setEmailInput("");
        setMessage({ text: `Successfully enrolled ${data.enrollment.user.name}!`, type: "success" });
        router.refresh();
      } else {
        setMessage({ text: data.error || "Failed to enroll student", type: "error" });
      }
    } catch {
      setMessage({ text: "An error occurred while enrolling the student", type: "error" });
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (enrollmentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this course?`)) return;

    setRemovingId(enrollmentId);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`/api/courses/${courseId}/enrollments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId })
      });

      if (res.ok) {
        setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
        setMessage({ text: `Successfully removed ${studentName} from the course.`, type: "success" });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to remove student", type: "error" });
      }
    } catch {
      setMessage({ text: "An error occurred while removing the student", type: "error" });
    } finally {
      setRemovingId(null);
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    const q = searchQuery.toLowerCase();
    return (
      e.user.name.toLowerCase().includes(q) ||
      e.user.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/dashboard/professor/course/${courseId}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-st-purple transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
        <div className="text-sm font-bold text-st-purple bg-st-purple/10 px-3 py-1 rounded-xl">
          Course: {courseName}
        </div>
      </div>

      {message.text && (
        <div className={`p-4 border rounded-2xl flex items-center gap-3 text-sm font-medium ${
          message.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Enrollment input form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-8 space-y-6">
            <h2 className="text-lg font-bold text-st-dark flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-st-purple" />
              Enroll Student
            </h2>
            <p className="text-gray-500 text-xs">Enter a registered student's email to add them to this class instantly.</p>

            <form onSubmit={handleEnroll} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="student@wsu.ac.kr"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark"
                />
              </div>

              <button
                type="submit"
                disabled={enrolling}
                className="w-full flex items-center justify-center gap-2 bg-st-purple hover:bg-st-indigo text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_20px_rgba(59,7,100,0.15)] disabled:opacity-60 cursor-pointer"
              >
                {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {enrolling ? "Enrolling..." : "Enroll Student"}
              </button>
            </form>
          </div>
        </div>

        {/* Right column - Student roster list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h2 className="text-lg font-bold text-st-dark flex items-center gap-2">
                <Users className="h-5 w-5 text-st-purple" />
                Enrolled Students
                <span className="bg-st-purple/10 text-st-purple text-xs px-2.5 py-0.5 rounded-full">
                  {enrollments.length}
                </span>
              </h2>

              <div className="flex items-center gap-2 bg-gray-50 border border-gray-250 rounded-xl px-3 py-1.5">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search roster..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-xs outline-none w-full text-st-dark placeholder:text-gray-400"
                />
              </div>
            </div>

            {filteredEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No students found matching search.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredEnrollments.map((e) => (
                  <div key={e.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0 hover:bg-gray-50/30 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-st-purple/10 flex items-center justify-center text-sm font-bold text-st-purple border border-st-purple/20">
                        {e.user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-st-dark text-sm">{e.user.name}</h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          <span>{e.user.email}</span>
                        </p>
                        <p className="text-[10px] text-gray-455 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>Enrolled: {new Date(e.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={removingId === e.id}
                      onClick={() => handleUnenroll(e.id, e.user.name)}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 p-2 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Unenroll student"
                    >
                      {removingId === e.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
