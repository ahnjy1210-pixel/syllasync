"use client";

import { useState } from "react";
import { Users, MessageCircle, ChevronRight } from "lucide-react";
import CourseChat from "@/app/components/CourseChat";

interface CourseInfo {
  id: string;
  name: string;
  studentCount: number;
  messageCount: number;
}

export default function ChatHubClient({
  courses,
  currentUserId,
  currentUserName,
}: {
  courses: CourseInfo[];
  currentUserId: string;
  currentUserName: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Course list */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Your Courses</h2>
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">No courses yet.</p>
          </div>
        ) : (
          courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full text-left bg-white rounded-2xl border p-4 transition-all flex items-center justify-between group ${
                selectedId === c.id
                  ? "border-st-purple shadow-md ring-2 ring-st-purple/20"
                  : "border-gray-100 hover:border-st-purple/30 hover:shadow-sm"
              }`}
            >
              <div>
                <h3 className="font-bold text-st-dark text-sm">{c.name}</h3>
                <div className="flex gap-4 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.studentCount}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{c.messageCount} msgs</span>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 shrink-0 transition-colors ${selectedId === c.id ? "text-st-purple" : "text-gray-300 group-hover:text-st-purple"}`} />
            </button>
          ))
        )}
      </div>

      {/* Chat panel */}
      <div className="lg:col-span-2">
        {selectedId ? (
          <CourseChat
            courseId={selectedId}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserRole="PROFESSOR"
          />
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 h-[500px] flex flex-col items-center justify-center">
            <MessageCircle className="h-12 w-12 text-gray-200 mb-3" />
            <p className="text-gray-400 font-medium">Select a course to open the chat</p>
            <p className="text-gray-300 text-sm mt-1">Messages appear in real-time</p>
          </div>
        )}
      </div>
    </div>
  );
}
