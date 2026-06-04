import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Megaphone, Send } from "lucide-react";
import AnnouncementForm from "./AnnouncementForm";
import AnnouncementsList from "./AnnouncementsList";

const prisma = new PrismaClient();

export default async function AnnouncementsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PROFESSOR") redirect("/login");

  const courses = await prisma.course.findMany({
    where: { professorId: session.user.id as string },
    select: { id: true, name: true },
  });

  const announcements = await prisma.announcement.findMany({
    where: { course: { professorId: session.user.id as string } },
    include: { course: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serialized = announcements.map((ann) => ({
    id: ann.id,
    title: ann.title,
    content: ann.content,
    attachmentUrl: ann.attachmentUrl,
    attachmentName: ann.attachmentName,
    createdAt: ann.createdAt.toISOString(),
    course: { name: ann.course.name },
  }));

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-st-purple/10 flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-st-purple" />
          </div>
          <h1 className="text-2xl font-extrabold text-st-dark tracking-tight">Announcements</h1>
        </div>
        <p className="text-gray-500 text-sm ml-13">Broadcast messages to all students in a course.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Compose Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h2 className="text-lg font-bold text-st-dark mb-4 flex items-center gap-2">
              <Send className="h-4 w-4 text-st-purple" />
              New Announcement
            </h2>
            <AnnouncementForm courses={courses} />
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-bold text-st-dark">History</h2>
          <AnnouncementsList initialAnnouncements={serialized} courses={courses} />
        </div>
      </div>
    </div>
  );
}

