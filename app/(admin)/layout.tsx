"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import { LayoutDashboard, Users2, Monitor, Activity, ShieldCheck, Settings, Bot, LogOut, Shield } from 'lucide-react';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);
  const sessionMinutes = useAuthStore((s) => s.sessionMinutes);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => { logout(); router.push('/'); };
  const initials = currentUser?.name?.split(' ').map((n) => n[0]).join('') || 'AD';

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users2 },
    { name: 'Inventory Control', href: '/admin/inventory', icon: Monitor },
    { name: 'System Analytics', href: '/admin/analytics', icon: Activity },
    { name: 'Audit Logs', href: '/admin/audit', icon: ShieldCheck },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50/20 flex font-sans">
      <aside className="w-64 bg-[#111827] text-gray-300 flex flex-col hidden lg:flex shadow-xl border-r border-[#1f2937]">
        <div className="h-16 flex items-center gap-3 px-6 bg-[#030712] border-b border-[#1f2937]">
          <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-inner">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Admin Console</span>
        </div>
        <div className="flex-1 py-8 flex flex-col gap-1 px-3">
          <p className="px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Global Settings</p>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]' : 'text-gray-400 hover:bg-[#1f2937] hover:text-gray-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 rounded-xl mx-2 mb-4 border border-red-500/20">
            <Shield className="h-4 w-4 text-red-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Session</span>
              <span className="text-xs font-medium text-red-300">{sessionMinutes} mins</span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-[#1f2937] mt-auto bg-[#0f172a]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md ring-2 ring-[#1f2937]">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{currentUser?.name || 'Admin'}</span>
              <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">{currentUser?.role || 'Admin'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f3f4f6]">
        <header className="h-16 bg-[#111827] flex items-center justify-between px-8 lg:hidden shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">Admin Console</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg">
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthGuard>
  );
}
