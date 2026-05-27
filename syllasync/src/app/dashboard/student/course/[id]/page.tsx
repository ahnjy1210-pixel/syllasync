import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { BookOpen, ArrowLeft, Clock, FileText, Download } from "lucide-react";
import Link from "next/link";
import CourseChat from "@/app/components/CourseChat";

const prisma = new PrismaClient();

export default async function StudentCourseDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "STUDENT") {
    redirect("/login");
  }

  // Verify enrollment and fetch course details
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id as string,
        courseId: params.id
      }
    },
    include: {
      course: {
        include: {
          professor: { select: { name: true, email: true } },
          lessons: { orderBy: { startTime: 'asc' } },
          homeworks: { orderBy: { dueDate: 'asc' } }
        }
      }
    }
  });

  if (!enrollment) {
    redirect("/dashboard/student");
  }

  const { course } = enrollment;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard/student" className="inline-flex items-center gap-2 text-neutral-400 hover:text-emerald-400 transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Course Header */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-5%] w-[30%] h-[150%] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <p className="text-emerald-400 font-medium mb-1 text-sm uppercase tracking-wider">Prof. {course.professor.name}</p>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{course.name}</h1>
              {course.description && (
                <p className="text-neutral-400 max-w-2xl">{course.description}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-neutral-700">
                <Download className="h-4 w-4" />
                Syllabus PDF
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Lessons Section */}
          <section>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-indigo-400" />
              Class Schedule & Notes
            </h2>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              {course.lessons.length === 0 ? (
                <p className="text-neutral-500 text-center py-4">No lessons scheduled yet.</p>
              ) : (
                <div className="space-y-4">
                  {course.lessons.map(lesson => (
                    <div key={lesson.id} className="flex justify-between items-center p-4 border border-neutral-800 rounded-xl bg-neutral-950/50">
                      <div>
                        <h4 className={`font-medium ${lesson.isCancelled ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>
                          {lesson.title}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(lesson.startTime).toLocaleString()} - {lesson.room || "TBA"}
                        </p>
                      </div>
                      <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 px-3 py-1.5 bg-indigo-500/10 rounded-lg">
                        View Notes
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Homework Section */}
          <section>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-orange-400" />
              Homework Feed
            </h2>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              {course.homeworks.length === 0 ? (
                <p className="text-neutral-500 text-center py-4">No homework assigned yet.</p>
              ) : (
                <div className="space-y-4">
                  {course.homeworks.map(hw => (
                    <div key={hw.id} className="p-4 border border-neutral-800 rounded-xl bg-neutral-950/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-neutral-200">{hw.title}</h4>
                        <span className="text-xs text-orange-400/80 font-medium px-2 py-1 bg-orange-500/10 rounded-md">
                          Due: {new Date(hw.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-400 line-clamp-2 mb-3">{hw.description}</p>
                      <button className="text-xs font-medium text-neutral-300 hover:text-white transition-colors">
                        Read full description &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Chat Section */}
          <section className="lg:col-span-2">
            <CourseChat 
              courseId={course.id} 
              currentUserId={session.user.id as string} 
              currentUserName={session.user.name || "Student"} 
              currentUserRole="STUDENT" 
            />
          </section>

        </div>
      </div>
    </div>
  );
}
