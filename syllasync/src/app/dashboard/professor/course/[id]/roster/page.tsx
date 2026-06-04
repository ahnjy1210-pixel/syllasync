import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import CourseRoster from "@/app/components/CourseRoster";

const prisma = new PrismaClient();

export default async function RosterPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "PROFESSOR") {
    redirect("/login");
  }

  const { id: courseId } = await params;

  // Fetch course details and check ownership
  const course = await prisma.course.findUnique({
    where: { 
      id: courseId,
      professorId: session.user.id
    },
    include: {
      enrollments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!course) {
    redirect("/dashboard/professor");
  }

  // Format enrollments for serializable transfer
  const formattedEnrollments = course.enrollments.map(e => ({
    id: e.id,
    createdAt: e.createdAt.toISOString(),
    user: {
      id: e.user.id,
      name: e.user.name,
      email: e.user.email
    }
  }));

  return (
    <div className="min-h-screen bg-st-light text-st-dark p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-st-dark tracking-tight">Manage Student Roster</h1>
          <p className="text-gray-500 text-sm mt-1">Review enrolled students, search for course members, register new users, or cancel enrollments.</p>
        </div>

        <CourseRoster
          courseId={course.id}
          courseName={course.name}
          initialEnrollments={formattedEnrollments}
        />
      </div>
    </div>
  );
}
