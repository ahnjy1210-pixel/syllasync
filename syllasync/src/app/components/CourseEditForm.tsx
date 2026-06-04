"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";

interface CourseEditFormProps {
  courseId: string;
  initialName: string;
  initialDescription: string;
  initialSyllabusUrl: string;
}

export default function CourseEditForm({
  courseId,
  initialName,
  initialDescription,
  initialSyllabusUrl
}: CourseEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [syllabusUrl, setSyllabusUrl] = useState(initialSyllabusUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Course name is required");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          syllabusUrl: syllabusUrl.trim() || null
        })
      });

      if (res.ok) {
        router.push(`/dashboard/professor/course/${courseId}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update course");
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
          <Save className="h-4 w-4" />
          {loading ? "Saving Changes..." : "Save Course Settings"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Course Info Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-st-dark flex items-center gap-2">
          <FileText className="h-5 w-5 text-st-purple" />
          Course Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Course Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Advanced Software Engineering"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide a description of this course..."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark resize-none"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Syllabus URL (PDF / Document Link)</label>
            <input
              type="url"
              value={syllabusUrl}
              onChange={(e) => setSyllabusUrl(e.target.value)}
              placeholder="e.g. https://woosong-my.sharepoint.com/syllabus.pdf"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none text-sm text-st-dark"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
