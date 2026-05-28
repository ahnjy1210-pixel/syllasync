import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Megaphone, Send, Clock, CheckCircle2 } from "lucide-react";
import AnnouncementForm from "./AnnouncementForm";

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
    take: 20,
  });

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
          {announcements.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center">
              <Megaphone className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No announcements yet.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <span className="text-xs font-bold text-st-purple bg-st-purple/10 px-2 py-0.5 rounded-md mr-2">
                      {ann.course.name}
                    </span>
                    <h3 className="text-base font-bold text-st-dark mt-2">{ann.title}</h3>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full shrink-0 font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Sent
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{ann.content}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {new Date(ann.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
