import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Calendar as CalendarIcon, BookOpen, Plus, FileText, Clock, GraduationCap, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function StudentDashboard() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "STUDENT") {
    redirect("/login");
  }

  // Fetch student's enrolled courses and upcoming homework
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          professor: { select: { name: true } },
          _count: { select: { lessons: true, homeworks: true } }
        }
      }
    }
  });

  const courses = enrollments.map(e => e.course);

  // Fetch upcoming homework for enrolled courses
  const upcomingHomework = await prisma.homework.findMany({
    where: {
      courseId: { in: courses.map(c => c.id) },
      dueDate: { gte: new Date() }
    },
    include: { course: { select: { name: true } } },
    orderBy: { dueDate: 'asc' },
    take: 5
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
                  <div className="text-xs text-gray-500">Student</div>
                </div>
                <div className="h-10 w-10 bg-st-lime/20 rounded-full flex items-center justify-center text-st-indigo font-bold border border-st-lime/30">
                  {session.user.name?.charAt(0) || "S"}
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
            <h1 className="text-3xl font-bold tracking-tight text-st-dark">Good morning, {session.user.name?.split(' ')[0] || ''}!</h1>
            <p className="text-gray-500 mt-1">Ready to tackle your classes today?</p>
          </div>
          <Link href="/dashboard/student/enroll" className="flex items-center gap-2 bg-st-purple hover:bg-st-indigo text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md">
            <Plus className="h-5 w-5" />
            Join Course
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Courses */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-st-dark">My Enrolled Courses</h2>
              </div>

              {courses.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
                  <div className="h-16 w-16 bg-st-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-st-indigo h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-st-dark mb-2">No courses yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">You haven't joined any classes. Ask your professor for an invite code.</p>
                  <Link href="/dashboard/student/enroll" className="inline-flex items-center gap-2 bg-st-purple hover:bg-st-indigo text-white px-6 py-3 rounded-xl font-medium transition-colors mx-auto text-sm shadow-md">
                    <Plus className="h-4 w-4" />
                    Enter Invite Code
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-st-lime/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-bold text-st-dark line-clamp-1">{course.name}</h3>
                          <span className="text-xs font-bold text-st-purple bg-st-purple/10 px-2 py-1 rounded-md">{course.inviteCode}</span>
                        </div>
                        <p className="text-sm text-gray-500">Prof. {course.professor.name}</p>
                      </div>
                      
                      <div className="flex gap-4 text-sm text-gray-500 mb-6 flex-grow">
                        <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-gray-400" /> {course._count.lessons} Lessons</span>
                        <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-gray-400" /> {course._count.homeworks} Tasks</span>
                      </div>
                      
                      <Link href={`/dashboard/student/course/${course.id}`} className="w-full flex items-center justify-center gap-2 bg-st-light text-st-dark font-bold py-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200 group-hover:border-st-purple/30 group-hover:text-st-purple">
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            {/* Recent Grades or Updates */}
            <section>
              <h2 className="text-lg font-bold text-st-dark mb-4">Recent Updates</h2>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-st-lime/10 border border-st-lime/20 mb-3">
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-st-indigo shadow-sm shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-st-dark text-sm">Grade Posted: Midterm Essay</h4>
                    <p className="text-xs text-gray-500 mt-0.5"><span className="font-semibold text-st-purple">ENG205</span> • 2 hours ago</p>
                  </div>
                  <div className="ml-auto font-bold text-st-indigo">92/100</div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-st-dark text-sm">New Syllabus Uploaded</h4>
                    <p className="text-xs text-gray-500 mt-0.5"><span className="font-semibold text-gray-700">CS101</span> • 1 day ago</p>
                  </div>
                  <button className="ml-auto text-sm text-st-purple font-bold hover:underline">View</button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Upcoming Homework */}
          <div className="space-y-6">
            <div className="bg-st-indigo rounded-3xl p-6 shadow-lg relative overflow-hidden text-white">
              <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-st-purple blur-[40px] pointer-events-none" />
              <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-st-lime/20 blur-[40px] pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <CalendarIcon className="h-5 w-5 text-st-lime" />
                <h2 className="text-lg font-bold">Upcoming Deadlines</h2>
              </div>

              <div className="relative z-10">
                {upcomingHomework.length === 0 ? (
                  <div className="text-center py-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-white/70 text-sm">You're all caught up!</p>
                    <p className="text-white/40 text-xs mt-1">No upcoming homework.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingHomework.map(hw => {
                      const isDueSoon = new Date(hw.dueDate).getTime() - new Date().getTime() < 48 * 60 * 60 * 1000;
                      return (
                        <div key={hw.id} className="bg-white/10 border border-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/15 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-bold text-white line-clamp-1 pr-2">{hw.title}</h4>
                            {isDueSoon && (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-st-lime animate-pulse mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-xs text-white/60 font-medium mb-3">{hw.course.name}</p>
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md w-fit ${isDueSoon ? 'bg-st-lime/20 text-st-lime border border-st-lime/30' : 'bg-white/5 text-white/80 border border-white/10'}`}>
                              <Clock className="h-3 w-3" />
                              Due: {new Date(hw.dueDate).toLocaleDateString()}
                            </div>
                            <button className="text-xs font-bold text-st-lime hover:underline">Submit</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
