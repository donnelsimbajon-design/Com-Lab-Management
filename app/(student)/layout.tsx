"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { LayoutDashboard, MonitorSmartphone, Search, CalendarClock, Bot, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => { logout(); router.push('/'); };
  const initials = currentUser?.name?.split(' ').map((n) => n[0]).join('') || 'ST';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden lg:flex">
        <div className="h-20 flex items-center px-6 border-b border-gray-50">
          <Link href="/student" className="flex items-center gap-3">
            <div className="bg-[#164ac9] rounded-lg p-1.5 flex items-center justify-center"><Bot className="h-5 w-5 text-white" /></div>
            <span className="font-bold text-gray-900 tracking-tight">ComLab Connect</span>
          </Link>
        </div>
        <div className="flex-1 py-8 px-4 flex flex-col gap-1">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          <Link href="/student" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold"><LayoutDashboard className="h-5 w-5" /><span className="text-sm">Dashboard</span></Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl font-medium"><MonitorSmartphone className="h-5 w-5" /><span className="text-sm">Equipment</span></Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl font-medium"><Search className="h-5 w-5" /><span className="text-sm">Lost & Found</span></Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl font-medium"><CalendarClock className="h-5 w-5" /><span className="text-sm">My Bookings</span></Link>
        </div>
        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#164ac9] flex items-center justify-center text-white font-bold text-sm">{initials}</div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{currentUser?.name || 'Student'}</span>
                <span className="text-[10px] text-gray-500">{currentUser?.schoolId || ''}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm border-b border-gray-100/50 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">Student</span><span>/</span><span className="text-gray-900 font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full border-gray-200 text-gray-500"><Bell className="h-4 w-4" /></Button>
            <Button className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-full px-6 font-semibold shadow-sm">+ Book a Lab</Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8"><div className="max-w-6xl mx-auto w-full">{children}</div></div>
      </main>
    </div>
  );
}
