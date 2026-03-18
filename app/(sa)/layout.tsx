"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { LayoutDashboard, Package, Ticket, CalendarClock, Bot, LogOut } from 'lucide-react';

export default function SALayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => { logout(); router.push('/'); };
  const initials = currentUser?.name?.split(' ').map((n) => n[0]).join('') || 'SA';

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans">
      <aside className="w-64 bg-[#f8fafc] border-r border-[#f1f5f9] flex flex-col hidden lg:flex">
        <div className="h-24 flex items-center px-8">
          <Link href="/sa" className="flex items-center gap-3">
            <div className="bg-[#164ac9] rounded-xl p-2.5 flex items-center justify-center shadow-lg shadow-blue-500/20"><Bot className="h-5 w-5 text-white" /></div>
            <span className="font-bold text-gray-900 tracking-tight text-[17px]">ComLab Connect</span>
          </Link>
        </div>
        <div className="flex-1 py-8 px-6 flex flex-col gap-2">
          <div className="w-6 h-0.5 bg-gray-200 mb-6 rounded-full ml-2" />
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-white rounded-2xl font-semibold"><LayoutDashboard className="h-4 w-4" /><span className="text-sm tracking-wide">Dashboard</span></Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-white rounded-2xl font-semibold"><Package className="h-4 w-4" /><span className="text-sm tracking-wide">Inventory</span></Link>
          <Link href="/sa" className="flex items-center gap-3 px-4 py-3 bg-[#eef2ff] text-[#164ac9] rounded-2xl font-bold shadow-sm"><Ticket className="h-4 w-4" /><span className="text-sm tracking-wide">Ticket Queue</span></Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-white rounded-2xl font-semibold"><CalendarClock className="h-4 w-4" /><span className="text-sm tracking-wide">Bookings</span></Link>
        </div>
        <div className="p-6 mt-auto">
          <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#164ac9] flex items-center justify-center text-white font-bold text-sm shadow-inner">{initials}</div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">{currentUser?.name || 'SA'}</span>
                <span className="text-[10px] text-gray-500 font-bold mt-0.5">Student Assistant</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/30">
        <div className="flex-1 overflow-auto p-12"><div className="max-w-6xl w-full mx-auto">{children}</div></div>
      </main>
    </div>
  );
}
