import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import LessonScheduler from "@/app/components/LessonScheduler";

const prisma = new PrismaClient();

export default async function CourseLessonsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "PROFESSOR") {
    redirect("/login");
  }

  const { id: courseId } = await params;

  // Fetch course details with lessons
  const course = await prisma.course.findUnique({
    where: { 
      id: courseId,
      professorId: session.user.id
    },
    include: {
      lessons: { orderBy: { startTime: 'asc' } }
    }
  });

  if (!course) {
    redirect("/dashboard/professor");
  }

  // Format lessons for the Client Component
  const formattedLessons = course.lessons.map(l => ({
    id: l.id,
    title: l.title,
    startTime: l.startTime.toISOString(),
    endTime: l.endTime.toISOString(),
    room: l.room || "",
    notes: l.notes || "",
    isCancelled: l.isCancelled
  }));

  return (
    <div className="min-h-screen bg-st-light text-st-dark p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-st-dark tracking-tight">Lesson Schedule Editor</h1>
          <p className="text-gray-500 text-sm mt-1">Add, update, or cancel classes and sessions.</p>
        </div>

        <LessonScheduler
          courseId={course.id}
          courseName={course.name}
          initialLessons={formattedLessons}
        />
      </div>
    </div>
  );
}
