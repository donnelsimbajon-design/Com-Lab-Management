"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { AuthGuard } from '@/components/auth-guard';
import { LayoutDashboard, Package, AlertTriangle, LogIn, Bot, LogOut, Shield } from 'lucide-react';

function SALayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);
  const sessionMinutes = useAuthStore((s) => s.sessionMinutes);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => { logout(); router.push('/'); };
  const initials = currentUser?.name?.split(' ').map((n) => n[0]).join('') || 'SA';

  const navigation = [
    { name: 'Dashboard', href: '/sa/dashboard', icon: LayoutDashboard },
    { name: 'Inventory Management', href: '/sa/inventory', icon: Package },
    { name: 'Ticket Queue', href: '/sa/tickets', icon: AlertTriangle },
    { name: 'Booking Requests', href: '/sa/bookings', icon: LogIn },
  ];

  return (
    <div className="min-h-screen bg-gray-50/20 flex font-sans">
      <aside className="w-64 bg-[#f8fafc] border-r border-gray-100 flex flex-col hidden lg:flex">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100 bg-white">
          <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">ComLab Connect</span>
        </div>
        <div className="flex-1 py-8 px-4 flex flex-col gap-1">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SA Menu</p>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-600 font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50/50 rounded-xl mb-4 border border-red-100/50">
            <Shield className="h-4 w-4 text-red-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Session</span>
              <span className="text-xs font-medium text-red-500">{sessionMinutes} mins remaining</span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 mt-auto bg-white">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm ring-4 ring-white shadow-sm">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">{currentUser?.name || 'SA'}</span>
              <span className="text-xs text-gray-500 font-medium capitalize">{currentUser?.role || 'SA'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">ComLab</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-lg">
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#fafcff]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SALayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['sa']}>
      <SALayoutInner>{children}</SALayoutInner>
    </AuthGuard>
  );
}
