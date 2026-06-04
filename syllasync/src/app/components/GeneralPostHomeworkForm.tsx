"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";

interface Course {
  id: string;
  name: string;
}

interface GeneralPostHomeworkFormProps {
  courses: Course[];
}

export default function GeneralPostHomeworkForm({ courses }: GeneralPostHomeworkFormProps) {
  const router = useRouter();
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return alert("Please select a course");
    
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          courseId, 
          title, 
          description, 
          dueDate: new Date(dueDate).toISOString() 
        }),
      });

      if (res.ok) {
        setMessage({ text: "Assignment posted successfully!", type: "success" });
        setTitle("");
        setDescription("");
        setDueDate("");
        setCourseId("");
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to post homework", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Something went wrong", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message.text && (
        <div className={`p-4 border rounded-2xl text-sm font-medium ${
          message.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 ml-1">Select Course</label>
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

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 ml-1">Homework Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none transition-all placeholder:text-gray-400 text-st-dark"
          placeholder="e.g. Chapter 4 Reading Reflection"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 ml-1">Description & Instructions</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none transition-all placeholder:text-gray-400 text-st-dark resize-none"
          placeholder="Write detailed instructions here..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 ml-1">Due Date & Time</label>
        <input
          type="datetime-local"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none transition-all text-st-dark"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-st-purple hover:bg-st-indigo text-white px-6 py-3 rounded-xl font-medium transition-all shadow-[0px_4px_20px_rgba(59,7,100,0.2)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Post Assignment
        </button>
      </div>
    </form>
  );
}
