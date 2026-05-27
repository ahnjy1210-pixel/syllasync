import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { BookOpen, ArrowLeft, Plus, Clock, FileText, Users } from "lucide-react";
import Link from "next/link";
import CourseChat from "@/app/components/CourseChat";

const prisma = new PrismaClient();

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "PROFESSOR") {
    redirect("/login");
  }

  // Fetch the course details
  const course = await prisma.course.findUnique({
    where: { 
      id: params.id,
      professorId: session.user.id // Ensure they own it
    },
    include: {
      lessons: { orderBy: { startTime: 'asc' } },
      homeworks: { orderBy: { dueDate: 'asc' } },
      enrollments: { include: { user: true } }
    }
  });

  if (!course) {
    redirect("/dashboard/professor");
  }

  return (
    <div className="min-h-screen bg-st-light text-st-dark p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard/professor" className="inline-flex items-center gap-2 text-gray-500 hover:text-st-purple transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        {/* Course Header */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-[-20%] right-[-5%] w-[30%] h-[150%] rounded-full bg-st-purple/5 blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="px-2.5 py-1 bg-st-purple/10 text-st-purple rounded-lg text-xs font-mono border border-st-purple/20">
                  Invite Code: {course.inviteCode}
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-st-dark">{course.name}</h1>
              {course.description && (
                <p className="text-gray-500 max-w-2xl">{course.description}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-st-dark px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-gray-200">
                Edit Course
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Lessons Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-st-dark">
                  <Clock className="h-5 w-5 text-st-purple" />
                  Schedule & Lessons
                </h2>
                <button className="flex items-center gap-2 bg-st-purple hover:bg-st-indigo text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                  <Plus className="h-4 w-4" /> Add Lesson
                </button>
              </div>
              
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                {course.lessons.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No lessons scheduled yet.</p>
                ) : (
                  <div className="space-y-4">
                    {course.lessons.map(lesson => (
                      <div key={lesson.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                        <div>
                          <h4 className="font-bold text-st-dark">{lesson.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(lesson.startTime).toLocaleString()} - {lesson.room || "TBA"}
                          </p>
                        </div>
                        <button className="text-xs font-bold text-st-indigo px-3 py-1.5 bg-st-lime rounded-lg hover:brightness-95 transition-all">
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Homework Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-st-dark">
                  <FileText className="h-5 w-5 text-st-purple" />
                  Homework & Assignments
                </h2>
                <Link href={`/dashboard/professor/course/${course.id}/homework/new`} className="flex items-center gap-2 bg-st-purple hover:bg-st-indigo text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                  <Plus className="h-4 w-4" /> Post Homework
                </Link>
              </div>
              
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                {course.homeworks.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No homework posted yet.</p>
                ) : (
                  <div className="space-y-4">
                    {course.homeworks.map(hw => (
                      <div key={hw.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                        <div>
                          <h4 className="font-bold text-st-dark">{hw.title}</h4>
                          <p className="text-xs text-orange-600 mt-1 font-medium">
                            Due: {new Date(hw.dueDate).toLocaleString()}
                          </p>
                        </div>
                        <button className="text-xs font-bold text-st-indigo px-3 py-1.5 bg-st-lime rounded-lg hover:brightness-95 transition-all">
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-st-dark">
                <Users className="h-5 w-5 text-st-purple" />
                Enrolled Students
              </h3>
              
              {course.enrollments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-2">No students enrolled.</p>
              ) : (
                <div className="space-y-3">
                  {course.enrollments.map(e => (
                    <div key={e.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-st-purple/10 flex items-center justify-center text-xs font-bold text-st-purple border border-st-purple/20">
                        {e.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-st-dark">{e.user.name}</p>
                        <p className="text-xs text-gray-500">{e.user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            <section className="mt-8">
              <CourseChat 
                courseId={course.id} 
                currentUserId={session.user.id as string} 
                currentUserName={session.user.name || "Professor"} 
                currentUserRole="PROFESSOR" 
              />
            </section>
          </div>
          
        </div>
      </div>
    </div>
  );
}
