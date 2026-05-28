"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, Megaphone, MessageSquare, Bell, Settings, LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard",        href: "/dashboard/professor",               icon: LayoutDashboard },
  { label: "Announcements",    href: "/dashboard/professor/announcements",  icon: Megaphone },
  { label: "Course Chat Hub",  href: "/dashboard/professor/chat",           icon: MessageSquare },
  { label: "Notifications",    href: "/dashboard/professor/notifications",  icon: Bell },
  { label: "Settings",         href: "/dashboard/professor/settings",       icon: Settings },
];

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          const unread = data.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Failed to fetch notification count:", err);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-st-light font-sans flex">
      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-st-indigo text-white flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:h-screen
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <Link href="/dashboard/professor" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-st-lime" />
            <span className="text-lg font-extrabold tracking-tight">SyllaSync</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-6 py-3">
          <span className="text-xs font-bold text-st-lime uppercase tracking-widest">Professor Panel</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard/professor" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-st-lime text-st-indigo shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </div>
                {label === "Notifications" && unreadCount > 0 && (
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                    active ? "bg-st-indigo text-white" : "bg-st-lime text-st-indigo"
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all w-full"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-4 h-14 px-4 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-st-dark hover:text-st-purple transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2 text-st-purple font-extrabold">
            <GraduationCap className="h-5 w-5 text-st-lime" />
            SyllaSync
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
