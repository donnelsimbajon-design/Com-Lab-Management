"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Ticket, Package, CalendarClock, Activity } from 'lucide-react';

export default function SADashboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const tickets = useAppStore((s) => s.tickets);
  const bookings = useAppStore((s) => s.bookings);
  const equipment = useAppStore((s) => s.equipment);
  const users = useAppStore((s) => s.users);
  const labs = useAppStore((s) => s.labs);

  const openTickets = tickets.filter((t) => t.status !== 'resolved');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const activeEquipment = equipment.filter((e) => e.status === 'in-use');
  const avgCap = labs.length ? Math.round(labs.reduce((a, l) => a + (l.occupiedUnits / l.totalUnits) * 100, 0) / labs.length) : 0;

  const recentTickets = [...tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentBookings = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'Unknown';
  const getEqName = (id: string) => equipment.find((e) => e.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div><h1 className="text-2xl font-bold text-gray-900">SA Dashboard</h1><p className="text-sm text-gray-500 mt-1">Welcome, {currentUser?.name?.split(' ')[0]}. Operations overview.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open Tickets', value: openTickets.length, sub: `${tickets.filter((t) => t.priority === 'high' && t.status !== 'resolved').length} high priority`, icon: <Ticket className="h-4 w-4 text-amber-500" />, subColor: 'text-red-500' },
          { label: 'Pending Bookings', value: pendingBookings.length, sub: 'Awaiting approval', icon: <CalendarClock className="h-4 w-4 text-blue-500" />, subColor: 'text-amber-500' },
          { label: 'Equipment In Use', value: activeEquipment.length, sub: `of ${equipment.length} total`, icon: <Package className="h-4 w-4 text-emerald-500" />, subColor: 'text-emerald-500' },
          { label: 'Lab Capacity', value: `${avgCap}%`, sub: 'Average utilization', icon: <Activity className="h-4 w-4 text-orange-500" />, subColor: 'text-gray-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>{s.icon}</div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className={`text-[10px] font-bold mt-1 ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between"><h2 className="font-bold text-sm text-gray-900">Recent Tickets</h2><span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span></div>
          <div className="divide-y divide-gray-50">
            {recentTickets.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div><p className="font-semibold text-sm text-gray-900">{t.title}</p><p className="text-[10px] text-gray-500 mt-0.5">{getUserName(t.userId)} · {t.lab}</p></div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${t.priority === 'high' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-100'}`}>{t.priority}</span>
                  <p className={`text-[9px] font-bold uppercase mt-1 ${t.status === 'open' ? 'text-amber-500' : t.status === 'in-progress' ? 'text-blue-500' : 'text-emerald-500'}`}>{t.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50"><h2 className="font-bold text-sm text-gray-900">Recent Bookings</h2></div>
          <div className="divide-y divide-gray-50">
            {recentBookings.map((b) => (
              <div key={b.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div><p className="font-semibold text-sm text-gray-900">{getEqName(b.equipmentId)}</p><p className="text-[10px] text-gray-500 mt-0.5">{getUserName(b.userId)} · Due: {b.dueDate}</p></div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${b.status === 'pending' ? 'text-amber-600 bg-amber-50 border-amber-100' : b.status === 'approved' ? 'text-blue-600 bg-blue-50 border-blue-100' : b.status === 'completed' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-4">Lab Status (Live)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {labs.map((l) => { const pct = Math.round((l.occupiedUnits / l.totalUnits) * 100); return (
            <div key={l.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div><p className="font-bold text-sm text-gray-900">{l.name}</p><p className="text-[10px] text-gray-500">{l.location}</p></div>
              <div className="text-right"><p className="text-sm font-bold text-gray-900">{l.totalUnits - l.occupiedUnits}<span className="text-gray-400 font-medium">/{l.totalUnits}</span></p><div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden"><div className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} /></div></div>
            </div>
          ); })}
        </div>
      </div>
    </div>
  );
}
