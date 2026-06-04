import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import StudentCourseTabs from "@/app/components/StudentCourseTabs";

const prisma = new PrismaClient();

export default async function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "STUDENT") {
    redirect("/login");
  }

  const { id: courseId } = await params;

  // Verify enrollment and fetch course details
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id as string,
        courseId: courseId
      }
    },
    include: {
      course: {
        include: {
          professor: { select: { name: true, email: true } },
          lessons: { orderBy: { startTime: 'asc' } },
          homeworks: { orderBy: { dueDate: 'asc' } },
          announcements: { orderBy: { createdAt: 'desc' } }
        }
      }
    }
  });

  if (!enrollment) {
    redirect("/dashboard/student");
  }

  const { course } = enrollment;

  // Map database model types to serializable properties for client component
  const serializedLessons = course.lessons.map(l => ({
    id: l.id,
    title: l.title,
    startTime: l.startTime.toISOString(),
    endTime: l.endTime.toISOString(),
    room: l.room,
    notes: l.notes,
    isCancelled: l.isCancelled
  }));

  const serializedHomeworks = course.homeworks.map(h => ({
    id: h.id,
    title: h.title,
    description: h.description,
    dueDate: h.dueDate.toISOString()
  }));

  const submissions = await prisma.submission.findMany({
    where: {
      studentId: session.user.id,
      homework: { courseId }
    }
  });

  const serializedSubmissions = submissions.map(s => ({
    id: s.id,
    homeworkId: s.homeworkId,
    content: s.content,
    fileUrl: s.fileUrl,
    fileName: s.fileName,
    grade: s.grade,
    feedback: s.feedback,
    submittedAt: s.submittedAt.toISOString()
  }));

  const serializedAnnouncements = course.announcements.map(a => ({
    id: a.id,
    title: a.title,
    content: a.content,
    attachmentUrl: a.attachmentUrl,
    attachmentName: a.attachmentName,
    createdAt: a.createdAt.toISOString()
  }));

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
              {course.syllabusUrl ? (
                <a
                  href={course.syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md"
                >
                  <Download className="h-4 w-4" />
                  Syllabus PDF
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 bg-neutral-800 text-neutral-500 px-4 py-2.5 rounded-xl text-sm font-medium border border-neutral-700 cursor-not-allowed"
                >
                  Syllabus not uploaded
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <StudentCourseTabs
          courseId={course.id}
          currentUserId={session.user.id as string}
          currentUserName={session.user.name || "Student"}
          lessons={serializedLessons}
          homeworks={serializedHomeworks}
          announcements={serializedAnnouncements}
          initialSubmissions={serializedSubmissions}
        />
      </div>
    </div>
  );
}

