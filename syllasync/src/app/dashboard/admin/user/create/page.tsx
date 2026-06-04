import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default function AdminUserCreatePage() {
  async function createUser(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (name && email && password && role) {
      try {
        await prisma.user.create({
          data: {
            name,
            email,
            passwordHash: password, // For simplicity in this demo, password is plain text
            role,
            isActive: true,
          }
        });
      } catch (error) {
        console.error("Failed to create user", error);
      }
    }
    
    redirect("/dashboard/admin/user");
  }

  return (
    <div className="p-8 bg-st-light min-h-[calc(100vh-64px)]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/admin/user" className="text-gray-400 hover:text-st-purple transition-colors font-semibold">
            &larr; Back to Users
          </Link>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="h-12 w-12 bg-st-purple/10 rounded-xl flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-st-purple" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-st-dark">Register New User</h1>
              <p className="text-sm text-gray-500">Create a new student or professor account directly.</p>
            </div>
          </div>

          <form action={createUser} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none transition-all"
                  placeholder="john@wsu.ac.kr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Role</label>
                <select 
                  name="role"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none transition-all cursor-pointer text-st-dark"
                >
                  <option value="STUDENT">Student</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit"
                className="bg-st-purple text-white px-8 py-3 rounded-xl font-medium hover:bg-st-indigo transition-all active:scale-95 shadow-md shadow-st-purple/20"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
