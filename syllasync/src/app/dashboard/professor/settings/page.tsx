import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Settings, User, Bell, Shield, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "PROFESSOR") {
    redirect("/login");
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-st-purple/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-st-purple" />
          </div>
          <h1 className="text-2xl font-extrabold text-st-dark tracking-tight">Account Settings</h1>
        </div>
        <p className="text-gray-500 text-sm ml-13">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Profile Section */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="h-24 w-24 rounded-2xl bg-st-purple/10 border-2 border-st-purple/20 flex flex-col items-center justify-center text-st-purple relative overflow-hidden shrink-0">
            <span className="text-3xl font-extrabold">{session.user.name?.charAt(0) || "P"}</span>
            <div className="absolute bottom-0 w-full bg-st-purple text-white text-[10px] font-bold text-center py-0.5 cursor-pointer hover:bg-st-indigo transition-colors">
              EDIT
            </div>
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-bold text-st-dark mb-1">{session.user.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{session.user.email}</p>
            <div className="flex gap-3">
              <span className="bg-st-lime/20 text-st-indigo font-bold text-xs px-3 py-1 rounded-full border border-st-lime/30">Professor</span>
              <span className="bg-gray-100 text-gray-600 font-bold text-xs px-3 py-1 rounded-full border border-gray-200">Department of Physics</span>
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="p-4 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4" /> Personal Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                  <input type="text" defaultValue={session.user.name || ""} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-st-dark focus:outline-none focus:ring-2 focus:ring-st-purple/20 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                  <input type="email" defaultValue={session.user.email || ""} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                  <p className="text-[10px] text-gray-400 mt-1">Contact IT support to change your institutional email.</p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-4 w-4" /> Security
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-st-purple/50 rounded-xl text-sm font-medium text-st-dark transition-all flex justify-between items-center group">
                  Change Password
                  <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-st-purple" />
                </button>
                <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-st-purple/50 rounded-xl text-sm font-medium text-st-dark transition-all flex justify-between items-center group">
                  Two-Factor Authentication (2FA)
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-md">Enabled</span>
                </button>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
            <button className="bg-st-purple hover:bg-st-indigo text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
