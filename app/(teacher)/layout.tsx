"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { LayoutDashboard, Clock, FileWarning, Laptop, Bot, LogOut } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => { logout(); router.push('/'); };
  const initials = currentUser?.name?.split(' ').map((n) => n[0]).join('') || 'TC';

  return (
    <div className="min-h-screen bg-white flex font-sans">
      <aside className="w-64 bg-[#f8fafc] border-r border-gray-100 flex flex-col hidden lg:flex">
        <div className="h-24 flex items-center px-8">
          <Link href="/teacher" className="flex items-center gap-3">
            <div className="bg-[#164ac9] rounded-xl p-2.5 flex items-center justify-center shadow-lg shadow-blue-500/20"><Bot className="h-6 w-6 text-white" /></div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">ComLab Connect</span>
          </Link>
        </div>
        <div className="flex-1 py-4 px-6 flex flex-col gap-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 mb-3">Main Menu</p>
          <Link href="/teacher" className="flex items-center gap-3 px-4 py-3.5 bg-[#eef2ff] text-[#164ac9] rounded-2xl font-bold shadow-sm"><LayoutDashboard className="h-5 w-5" /><span className="text-sm">Dashboard</span></Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-2xl font-semibold"><Clock className="h-5 w-5" /><span className="text-sm">Class Schedules</span></Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-2xl font-semibold"><FileWarning className="h-5 w-5" /><span className="text-sm">Incident Reports</span></Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-2xl font-semibold"><Laptop className="h-5 w-5" /><span className="text-sm">Software Requests</span></Link>
        </div>
        <div className="p-6 mt-auto">
          <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#164ac9] flex items-center justify-center text-white font-bold text-sm shadow-inner">{initials}</div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">{currentUser?.name || 'Teacher'}</span>
                <span className="text-[10px] text-gray-500 font-medium mt-0.5">Faculty Member</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        <div className="flex-1 overflow-auto p-12"><div className="max-w-6xl w-full mx-auto">{children}</div></div>
      </main>
    </div>
  );
}
