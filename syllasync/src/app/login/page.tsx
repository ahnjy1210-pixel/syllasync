"use client";

import { useState } from "react";
import { BookOpen, ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (res?.error) {
        alert("Invalid credentials");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-st-light flex flex-col font-sans selection:bg-st-lime/30">
      {/* TopNavBar */}
      <header className="w-full top-0 sticky bg-white shadow-sm z-50">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold text-st-purple flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-st-lime" />
            SyllaSync
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/register" className="bg-st-purple text-white font-medium px-5 py-2.5 rounded-lg hover:bg-st-indigo transition-all active:scale-95 shadow-md">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-st-purple rounded-full mix-blend-multiply filter blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-st-lime rounded-full mix-blend-multiply filter blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="w-full max-w-[440px] relative z-10">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 sm:p-10">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-st-purple/10 rounded-2xl flex items-center justify-center">
                <BookOpen className="text-st-purple h-8 w-8" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-2 tracking-tight text-st-dark">Welcome Back</h1>
            <p className="text-gray-500 text-center mb-8 text-sm">Log in to manage your syllabi efficiently.</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none transition-all placeholder:text-gray-400 text-st-dark"
                  placeholder="name@wsu.ac.kr"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-sm font-medium text-st-purple hover:underline">Forgot Password?</a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none transition-all placeholder:text-gray-400 text-st-dark"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-st-purple hover:bg-st-indigo text-white font-medium py-3.5 rounded-xl transition-all shadow-[0px_4px_20px_rgba(59,7,100,0.2)] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Log In
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-gray-100 pt-6">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-st-purple font-bold hover:underline transition-all">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-st-dark text-white flex flex-col md:flex-row items-center justify-between px-6 md:px-12 mt-auto">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <GraduationCap className="h-6 w-6 text-st-lime" />
          <span className="text-xl font-bold">SyllaSync</span>
        </div>
        <div className="text-sm text-gray-400 mb-4 md:mb-0">
          © 2026 SyllaSync. All rights reserved.
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <a className="text-gray-400 hover:text-white transition-colors cursor-pointer" href="#">Institutional Links</a>
          <a className="text-gray-400 hover:text-white transition-colors cursor-pointer" href="#">Contact Info</a>
          <a className="text-gray-400 hover:text-white transition-colors cursor-pointer" href="#">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
