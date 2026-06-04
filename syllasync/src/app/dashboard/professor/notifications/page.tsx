import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Bell } from "lucide-react";
import NotificationActions from "./NotificationActions";
import NotificationsList from "./NotificationsList";

const prisma = new PrismaClient();

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PROFESSOR") redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const serializedNotifications = notifications.map(n => ({
    id: n.id,
    title: n.title,
    body: n.body,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
    link: n.link
  }));

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-st-purple/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-st-purple" />
            </div>
            <h1 className="text-2xl font-extrabold text-st-dark tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-st-purple text-white text-xs font-bold px-2.5 py-1 rounded-full">{unreadCount}</span>
            )}
          </div>
          <p className="text-gray-500 text-sm ml-13">Your latest system alerts and updates.</p>
        </div>
        {unreadCount > 0 && <NotificationActions />}
      </div>

      {/* Notifications list */}
      <NotificationsList initialNotifications={serializedNotifications} />
    </div>
  );
}
