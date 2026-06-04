import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { BookOpen, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function CourseEditorIndex() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "PROFESSOR") {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    where: { professorId: session.user.id, isActive: true },
    include: {
      _count: {
        select: { enrollments: true, lessons: true, homeworks: true }
      }
    }
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-st-purple/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-st-purple" />
            </div>
            <h1 className="text-2xl font-extrabold text-st-dark tracking-tight">Course Editor</h1>
          </div>
          <p className="text-gray-500 text-sm ml-13">Select a course to edit its syllabus and content.</p>
        </div>
        <Link href="/dashboard/professor/create" className="flex items-center gap-2 bg-st-purple hover:bg-st-indigo text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md">
          <Plus className="h-5 w-5" />
          New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
          <h3 className="text-xl font-bold text-st-dark mb-2">No active courses</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">You haven't created any courses yet. Get started by setting up your first syllabus.</p>
          <Link href="/dashboard/professor/create" className="inline-flex items-center gap-2 bg-st-purple text-white px-6 py-3 rounded-xl font-medium hover:bg-st-indigo transition-colors shadow-md">
            <Plus className="h-5 w-5" />
            Create Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/dashboard/professor/course/${course.id}`} className="block group">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-all relative overflow-hidden group-hover:border-st-purple/30">
                <div className="absolute top-0 right-0 w-24 h-24 bg-st-purple/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="mb-4">
                  <div className="text-xs font-bold text-st-purple uppercase tracking-wider mb-1">{course.inviteCode}</div>
                  <h3 className="text-xl font-bold text-st-dark group-hover:text-st-purple transition-colors">{course.name}</h3>
                </div>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">{course.description || "No description provided."}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-400">
                    {course._count.lessons} Lessons
                  </div>
                  <div className="flex items-center gap-1 text-st-purple font-bold text-sm">
                    Edit Course <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
