import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProfessorCourseTabs from "@/app/components/ProfessorCourseTabs";

const prisma = new PrismaClient();

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "PROFESSOR") {
    redirect("/login");
  }

  const { id: courseId } = await params;

  // Fetch the course with all necessary data for tabs
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      professorId: session.user.id
    },
    include: {
      lessons: { orderBy: { startTime: "asc" } },
      homeworks: { orderBy: { dueDate: "asc" } },
      enrollments: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" }
      },
      announcements: {
        orderBy: { createdAt: "desc" },
        include: {
          views: {
            include: {
              user: { select: { id: true, name: true } }
            }
          }
        }
      }
    }
  });

  if (!course) {
    redirect("/dashboard/professor");
  }

  // Fetch all submissions for all homeworks in this course
  const allSubmissions = await prisma.submission.findMany({
    where: {
      homework: { courseId }
    },
    orderBy: { submittedAt: "desc" }
  });

  // Serialize data (convert Dates to strings)
  const serializedLessons = course.lessons.map((l) => ({
    id: l.id,
    title: l.title,
    startTime: l.startTime.toISOString(),
    endTime: l.endTime.toISOString(),
    room: l.room ?? "",
    notes: l.notes ?? "",
    isCancelled: l.isCancelled
  }));

  const serializedHomeworks = course.homeworks.map((hw) => ({
    id: hw.id,
    title: hw.title,
    description: hw.description,
    dueDate: hw.dueDate.toISOString()
  }));

  const serializedEnrollments = course.enrollments.map((e) => ({
    id: e.id,
    userId: e.userId,
    createdAt: e.createdAt.toISOString(),
    user: {
      id: e.user.id,
      name: e.user.name,
      email: e.user.email
    }
  }));

  const serializedAnnouncements = course.announcements.map((ann) => ({
    id: ann.id,
    title: ann.title,
    content: ann.content,
    attachmentUrl: ann.attachmentUrl,
    attachmentName: ann.attachmentName,
    createdAt: ann.createdAt.toISOString(),
    views: ann.views.map((v) => ({
      userId: v.userId,
      userName: v.user.name,
      viewedAt: v.viewedAt.toISOString()
    }))
  }));

  const serializedSubmissions = allSubmissions.map((s) => ({
    id: s.id,
    homeworkId: s.homeworkId,
    studentId: s.studentId,
    content: s.content,
    fileUrl: s.fileUrl,
    fileName: s.fileName,
    grade: s.grade,
    feedback: s.feedback,
    submittedAt: s.submittedAt.toISOString()
  }));

  return (
    <div className="min-h-screen bg-st-light text-st-dark p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dashboard/professor"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-st-purple transition-colors mb-6 text-sm font-medium"
        >
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
              <Link
                href={`/dashboard/professor/course/${courseId}/edit`}
                className="flex items-center gap-2 bg-st-purple hover:bg-st-indigo text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Edit Course
              </Link>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <ProfessorCourseTabs
          courseId={courseId}
          courseName={course.name}
          currentUserId={session.user.id as string}
          currentUserName={session.user.name || "Professor"}
          lessons={serializedLessons}
          homeworks={serializedHomeworks}
          enrollments={serializedEnrollments}
          announcements={serializedAnnouncements}
          initialSubmissions={serializedSubmissions}
        />
      </div>
    </div>
  );
}
