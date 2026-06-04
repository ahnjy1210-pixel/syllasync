import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import CourseEditForm from "@/app/components/CourseEditForm";

const prisma = new PrismaClient();

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "PROFESSOR") {
    redirect("/login");
  }

  const { id: courseId } = await params;

  // Fetch course details
  const course = await prisma.course.findUnique({
    where: { 
      id: courseId,
      professorId: session.user.id
    }
  });

  if (!course) {
    redirect("/dashboard/professor");
  }

  return (
    <div className="min-h-screen bg-st-light text-st-dark p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-st-dark tracking-tight">Edit Course Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Update course metadata, description, or link a syllabus.</p>
        </div>

        <CourseEditForm
          courseId={course.id}
          initialName={course.name}
          initialDescription={course.description || ""}
          initialSyllabusUrl={course.syllabusUrl || ""}
        />
      </div>
    </div>
  );
}
