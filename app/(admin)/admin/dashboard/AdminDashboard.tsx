"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Activity, Users, Package, Ticket, TrendingUp, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const users = useAppStore((s) => s.users);
  const equipment = useAppStore((s) => s.equipment);
  const bookings = useAppStore((s) => s.bookings);
  const tickets = useAppStore((s) => s.tickets);
  const softwareRequests = useAppStore((s) => s.softwareRequests);
  const labs = useAppStore((s) => s.labs);

  const activeBookings = bookings.filter((b) => b.status === 'approved' || b.status === 'pending').length;
  const openTickets = tickets.filter((t) => t.status !== 'resolved').length;
  const pendingSoftware = softwareRequests.filter((r) => r.status === 'pending').length;
  const avgCap = labs.length ? Math.round(labs.reduce((a, l) => a + (l.occupiedUnits / l.totalUnits) * 100, 0) / labs.length) : 0;
  const recentBookings = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div><h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1><p className="text-sm text-gray-500 mt-1">Welcome, {currentUser?.name?.split(' ')[0]}. System overview.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, sub: `${users.filter((u) => u.role === 'student').length} students`, icon: <Users className="h-4 w-4 text-blue-500" />, subColor: 'text-blue-500' },
          { label: 'Equipment', value: equipment.length, sub: `${equipment.filter((e) => e.status === 'available').length} available`, icon: <Package className="h-4 w-4 text-emerald-500" />, subColor: 'text-emerald-500' },
          { label: 'Active Bookings', value: activeBookings, sub: `${bookings.filter((b) => b.status === 'pending').length} pending`, icon: <Calendar className="h-4 w-4 text-amber-500" />, subColor: 'text-amber-500' },
          { label: 'Open Tickets', value: openTickets, sub: `${tickets.filter((t) => t.priority === 'high').length} critical`, icon: <Ticket className="h-4 w-4 text-red-500" />, subColor: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>{s.icon}</div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p><p className={`text-[10px] font-bold mt-1 ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50"><h2 className="font-bold text-sm text-gray-900">Recent Activity</h2></div>
          <div className="divide-y divide-gray-50">
            {recentBookings.map((b) => { const u = users.find((u) => u.id === b.userId); const eq = equipment.find((e) => e.id === b.equipmentId); return (
              <div key={b.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                <div><p className="font-semibold text-sm text-gray-900">{u?.name || 'Unknown'} → {eq?.name || 'Unknown'}</p><p className="text-[10px] text-gray-500 mt-0.5">{b.createdAt}</p></div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${b.status === 'pending' ? 'text-amber-600 bg-amber-50 border-amber-100' : b.status === 'approved' ? 'text-blue-600 bg-blue-50 border-blue-100' : b.status === 'completed' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>{b.status}</span>
              </div>
            ); })}
          </div>
        </div>
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-bold text-sm text-gray-900 mb-4">Pending Actions</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Software Requests</span><span className="text-xs font-bold text-amber-600">{pendingSoftware}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Booking Approvals</span><span className="text-xs font-bold text-amber-600">{bookings.filter((b) => b.status === 'pending').length}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Open Tickets</span><span className="text-xs font-bold text-red-600">{openTickets}</span></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-bold text-sm text-gray-900 mb-4">Lab Capacity</h2>
            <p className="text-3xl font-bold text-gray-900">{avgCap}%</p>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden"><div className={`h-full rounded-full ${avgCap > 80 ? 'bg-red-500' : avgCap > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${avgCap}%` }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
