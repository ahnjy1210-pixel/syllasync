import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Bell, CheckCheck, Mail, MailOpen } from "lucide-react";
import NotificationActions from "./NotificationActions";

const prisma = new PrismaClient();

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PROFESSOR") redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border p-5 transition-all ${
                n.isRead
                  ? "border-gray-100"
                  : "border-st-purple/20 shadow-sm bg-st-purple/[0.02]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  n.isRead ? "bg-gray-100 text-gray-400" : "bg-st-lime text-st-indigo"
                }`}>
                  {n.isRead ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-bold mb-0.5 ${n.isRead ? "text-gray-600" : "text-st-dark"}`}>
                    {n.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-st-purple shrink-0 mt-1.5" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
