import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import ChatHubClient from "./ChatHubClient";

const prisma = new PrismaClient();

export default async function ChatHubPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PROFESSOR") redirect("/login");

  const courses = await prisma.course.findMany({
    where: { professorId: session.user.id as string },
    include: {
      _count: { select: { enrollments: true, messages: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-st-purple/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-st-purple" />
          </div>
          <h1 className="text-2xl font-extrabold text-st-dark tracking-tight">Course Chat Hub</h1>
        </div>
        <p className="text-gray-500 text-sm ml-13">Select a course to view and participate in the live chat.</p>
      </div>

      <ChatHubClient
        courses={courses.map(c => ({
          id: c.id,
          name: c.name,
          studentCount: c._count.enrollments,
          messageCount: c._count.messages,
        }))}
        currentUserId={session.user.id as string}
        currentUserName={session.user.name || "Professor"}
      />
    </div>
  );
}
