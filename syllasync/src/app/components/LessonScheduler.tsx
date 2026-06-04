"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, Calendar, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface Lesson {
  id?: string;
  title: string;
  startTime: string;
  endTime: string;
  room: string;
  notes: string;
  isCancelled: boolean;
}

interface LessonSchedulerProps {
  courseId: string;
  courseName: string;
  initialLessons: Lesson[];
}

export default function LessonScheduler({
  courseId,
  courseName,
  initialLessons
}: LessonSchedulerProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddLesson = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0);
    const startStr = nextWeek.toISOString().slice(0, 16);
    nextWeek.setHours(10, 30, 0, 0);
    const endStr = nextWeek.toISOString().slice(0, 16);

    setLessons([
      ...lessons,
      {
        title: "",
        startTime: startStr,
        endTime: endStr,
        room: "",
        notes: "",
        isCancelled: false
      }
    ]);
  };

  const handleRemoveLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleLessonChange = (index: number, field: keyof Lesson, value: any) => {
    setLessons(
      lessons.map((lesson, i) => {
        if (i === index) {
          return { ...lesson, [field]: value };
        }
        return lesson;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate lessons
    for (let i = 0; i < lessons.length; i++) {
      if (!lessons[i].title.trim()) {
        return setError(`Lesson ${i + 1} must have a title`);
      }
      if (!lessons[i].startTime || !lessons[i].endTime) {
        return setError(`Lesson ${i + 1} must have a valid schedule`);
      }
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: courseName, // Needed for API schema validation
          lessons
        })
      });

      if (res.ok) {
        router.push(`/dashboard/professor/course/${courseId}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update schedule");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/dashboard/professor/course/${courseId}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-st-purple transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course Detail
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-st-purple hover:bg-st-indigo text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(59,7,100,0.2)] disabled:opacity-60 cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? "Saving Schedule..." : "Save Lesson Schedule"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Lessons Management Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-st-dark flex items-center gap-2">
            <Calendar className="h-5 w-5 text-st-purple" />
            Class Schedule & Lessons ({courseName})
          </h2>
          <button
            type="button"
            onClick={handleAddLesson}
            className="flex items-center gap-2 bg-st-lime text-st-indigo font-bold px-4 py-2 rounded-xl text-xs hover:brightness-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Lesson
          </button>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No lessons scheduled. Add a lesson to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {lessons.map((lesson, index) => (
              <div
                key={index}
                className={`p-5 rounded-2xl border transition-all ${
                  lesson.isCancelled
                    ? "bg-red-50/20 border-red-200"
                    : "bg-gray-50/50 border-gray-100"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <span className="text-xs font-bold text-st-purple bg-st-purple/10 px-2 py-0.5 rounded">
                    Lesson {index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-red-600 font-bold select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lesson.isCancelled}
                        onChange={(e) => handleLessonChange(index, "isCancelled", e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4"
                      />
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Cancel Class
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Remove lesson"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Lesson Title</label>
                    <input
                      type="text"
                      required
                      value={lesson.title}
                      onChange={(e) => handleLessonChange(index, "title", e.target.value)}
                      placeholder="e.g. Intro to React Router"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-st-purple text-st-dark"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Start Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={lesson.startTime.slice(0, 16)}
                      onChange={(e) => handleLessonChange(index, "startTime", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-st-purple text-st-dark"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">End Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={lesson.endTime.slice(0, 16)}
                      onChange={(e) => handleLessonChange(index, "endTime", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-st-purple text-st-dark"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Room / Building</label>
                    <input
                      type="text"
                      value={lesson.room}
                      onChange={(e) => handleLessonChange(index, "room", e.target.value)}
                      placeholder="e.g. W1 302"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-st-purple text-st-dark"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Notes (Optional)</label>
                    <input
                      type="text"
                      value={lesson.notes}
                      onChange={(e) => handleLessonChange(index, "notes", e.target.value)}
                      placeholder="e.g. Read Chapter 2 ahead of class"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-st-purple text-st-dark"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
