"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { LayoutDashboard, Users, Package, BarChart3, Settings, Bot, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => { logout(); router.push('/'); };
  const initials = currentUser?.name?.split(' ').map((n) => n[0]).join('') || 'AD';

  return (
    <div className="min-h-screen bg-gray-50/20 flex font-sans">
      <aside className="w-64 bg-[#f8fafc] border-r border-gray-100 flex flex-col hidden lg:flex">
        <div className="h-24 flex items-center px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="bg-[#164ac9] rounded-lg p-2.5 flex items-center justify-center shadow-md"><Bot className="h-5 w-5 text-white" /></div>
            <span className="font-bold text-gray-900 tracking-tight text-[17px]">ComLab Connect</span>
          </Link>
        </div>
        <div className="flex-1 py-8 px-6 flex flex-col gap-2">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Main Menu</p>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-white rounded-2xl font-semibold"><LayoutDashboard className="h-4 w-4" /><span className="text-sm tracking-wide">Dashboard</span></Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-white rounded-2xl font-semibold"><Users className="h-4 w-4" /><span className="text-sm tracking-wide">User Management</span></Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-white rounded-2xl font-semibold"><Package className="h-4 w-4" /><span className="text-sm tracking-wide">Inventory</span></Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-[#eef2ff] text-[#164ac9] rounded-2xl font-bold shadow-sm"><BarChart3 className="h-4 w-4" /><span className="text-sm tracking-wide">System Analytics</span></Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-white rounded-2xl font-semibold mt-4 border-t border-gray-100/50 pt-5"><Settings className="h-4 w-4" /><span className="text-sm tracking-wide">Settings</span></Link>
        </div>
        <div className="p-6 mt-auto">
          <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#164ac9] flex items-center justify-center text-white font-bold text-sm shadow-inner">{initials}</div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">{currentUser?.name || 'Admin'}</span>
                <span className="text-[10px] text-gray-400 font-bold mt-0.5">System Admin</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white/40">
        <div className="flex-1 overflow-auto p-12"><div className="max-w-6xl w-full mx-auto">{children}</div></div>
      </main>
    </div>
  );
}
