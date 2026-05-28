import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Plus, BookOpen, Clock, Users, Send, Calendar, CheckCircle2, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import QuickBroadcastForm from "./QuickBroadcastForm";

const prisma = new PrismaClient();

export default async function ProfessorDashboard() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "PROFESSOR") {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    where: { professorId: session.user.id },
    include: {
      _count: {
        select: { enrollments: true, lessons: true, homeworks: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-st-light font-sans selection:bg-st-lime/30">
      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold flex items-center gap-2 text-st-purple">
              <GraduationCap className="h-6 w-6 text-st-lime" />
              SyllaSync
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-st-dark">{session.user.name}</div>
                  <div className="text-xs text-gray-500">Professor</div>
                </div>
                <div className="h-10 w-10 bg-st-purple/10 rounded-full flex items-center justify-center text-st-purple font-bold border border-st-purple/20">
                  {session.user.name?.charAt(0) || "P"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-st-dark">Welcome back, Prof. {session.user.name?.split(' ')[0] || ''}</h1>
            <p className="text-gray-500 mt-1">Here's what's happening in your classes today.</p>
          </div>
          <Link href="/dashboard/professor/create" className="flex items-center gap-2 bg-st-purple hover:bg-st-indigo text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md">
            <Plus className="h-5 w-5" />
            New Course
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Courses & Assignments) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Courses */}
            <section>
              <h2 className="text-lg font-bold text-st-dark mb-4">Active Courses</h2>
              {courses.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
                  <div className="h-16 w-16 bg-st-purple/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-st-purple h-8 w-8" />
                  </div>
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
                    <div key={course.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-st-purple/5 rounded-bl-full -z-10"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-xs font-bold text-st-purple uppercase tracking-wider mb-1">{course.inviteCode}</div>
                          <h3 className="text-xl font-bold text-st-dark">{course.name}</h3>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">{course.description || "No description provided."}</p>
                      
                      <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-gray-400" /> {course._count.enrollments} Students</div>
                        <div className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-gray-400" /> {course._count.lessons} Lessons</div>
                      </div>
                      
                      <Link href={`/dashboard/professor/course/${course.id}`} className="w-full flex items-center justify-center gap-2 bg-st-lime text-st-indigo font-bold py-3 rounded-xl hover:brightness-95 transition-all">
                        Manage Syllabus
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Assignment Tracker */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-st-dark">Assignment Tracker</h2>
                <Link href="#" className="text-sm font-bold text-st-purple hover:underline">View All</Link>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Assignment</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Course</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Submitted</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-4 px-6 font-medium text-st-dark">Midterm Essay Draft</td>
                      <td className="py-4 px-6 text-sm text-gray-500">ENG205</td>
                      <td className="py-4 px-6 text-sm text-gray-500">24/30</td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span> Due Tomorrow
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-4 px-6 font-medium text-st-dark">Programming Lab 3</td>
                      <td className="py-4 px-6 text-sm text-gray-500">CS101</td>
                      <td className="py-4 px-6 text-sm text-gray-500">45/45</td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Needs Grading
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Column (Widgets) */}
          <div className="space-y-6">
            {/* Quick Broadcast Widget */}
            <div className="bg-st-purple rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/10 blur-[40px] pointer-events-none" />
              <h2 className="text-xl font-bold mb-2 relative z-10">Quick Broadcast</h2>
              <p className="text-st-purple-200 text-sm mb-4 text-white/70 relative z-10">Send an instant announcement to all your students.</p>
              <QuickBroadcastForm courses={courses.map(c => ({ id: c.id, name: c.name }))} />
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-st-dark mb-4">Today's Schedule</h2>
              <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-st-lime text-st-indigo shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-st-dark text-sm">CS101 Lecture</div>
                      <div className="text-xs font-bold text-st-purple">09:00 AM</div>
                    </div>
                    <div className="text-xs text-gray-500">Room 302, Building W1</div>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-100 text-gray-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-gray-700 text-sm">Office Hours</div>
                      <div className="text-xs font-bold text-gray-400">02:00 PM</div>
                    </div>
                    <div className="text-xs text-gray-500">Online via Zoom</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
