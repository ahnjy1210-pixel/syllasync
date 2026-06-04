import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { FileText, Send } from "lucide-react";
import GeneralPostHomeworkForm from "@/app/components/GeneralPostHomeworkForm";
import HomeworkList from "@/app/components/HomeworkList";

const prisma = new PrismaClient();

export default async function GeneralPostHomeworkPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "PROFESSOR") {
    redirect("/login");
  }

  // Fetch all courses taught by the professor
  const courses = await prisma.course.findMany({
    where: { professorId: session.user.id },
    select: { id: true, name: true }
  });

  // Fetch all homeworks for the professor's courses
  const homeworks = await prisma.homework.findMany({
    where: { course: { professorId: session.user.id } },
    include: { course: { select: { name: true } } },
    orderBy: { dueDate: "asc" }
  });

  const serialized = homeworks.map(hw => ({
    id: hw.id,
    title: hw.title,
    description: hw.description,
    dueDate: hw.dueDate.toISOString(),
    courseId: hw.courseId,
    createdAt: hw.createdAt.toISOString(),
    course: { name: hw.course.name }
  }));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-st-purple/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-st-purple" />
          </div>
          <h1 className="text-2xl font-extrabold text-st-dark tracking-tight">Assignment Tracker</h1>
        </div>
        <p className="text-gray-500 text-sm ml-13">Post new assignments and manage already posted tasks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Compose Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h2 className="text-lg font-bold text-st-dark mb-4 flex items-center gap-2">
              <Send className="h-4 w-4 text-st-purple" />
              New Assignment
            </h2>
            <GeneralPostHomeworkForm courses={courses} />
          </div>
        </div>

        {/* History/Tracker Panel */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-bold text-st-dark">Posted Homeworks</h2>
          <HomeworkList initialHomeworks={serialized} showCourseBadge={true} />
        </div>
      </div>
    </div>
  );
}
