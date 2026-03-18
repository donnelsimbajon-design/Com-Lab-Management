"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { Search, Bell, CheckCircle2, Shield, Activity, MapPin, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SADashboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const tickets = useAppStore((s) => s.tickets);
  const bookings = useAppStore((s) => s.bookings);
  const users = useAppStore((s) => s.users);
  const equipment = useAppStore((s) => s.equipment);
  const updateTicketStatus = useAppStore((s) => s.updateTicketStatus);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);

  // Derived
  const activeTickets = tickets.filter((t) => t.status !== 'resolved');
  const resolvedToday = tickets.filter((t) => t.status === 'resolved');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'Unknown';
  const getEquipmentName = (id: string) => equipment.find((e) => e.id === id)?.name || 'Unknown';

  const priorityColor: Record<string, string> = {
    high: 'text-red-600 bg-red-50/80',
    medium: 'text-gray-600 bg-gray-200/60',
    low: 'text-gray-500 bg-gray-100',
  };
  const statusColor: Record<string, string> = {
    'open': 'text-gray-400',
    'in-progress': 'text-[#164ac9]',
    'resolved': 'text-emerald-600',
  };

  const handleResolve = (id: string) => {
    updateTicketStatus(id, 'resolved');
    toast.success('Ticket resolved! User has been notified.');
  };
  const handleEscalate = (id: string) => {
    updateTicketStatus(id, 'in-progress');
    toast.info('Ticket escalated to Admin.');
  };
  const handleApproveBooking = (id: string) => {
    updateBookingStatus(id, 'approved');
    toast.success('Booking approved! Equipment is now in use.');
  };
  const handleDenyBooking = (id: string) => {
    updateBookingStatus(id, 'denied');
    toast.warning('Booking denied.');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Maintenance Tickets</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Manage and resolve laboratory issues.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative shadow-sm rounded-xl overflow-hidden">
            <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search tickets..." className="pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-72 focus:outline-none focus:border-blue-300 transition-all font-medium placeholder:text-gray-400" />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-gray-200 bg-white h-10 w-10 shadow-sm">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#f8fafc] border border-[#f1f5f9] p-6 rounded-[1.5rem]">
          <h3 className="text-[11px] font-bold text-gray-500 tracking-widest mb-3">Active Tickets</h3>
          <p className="text-2xl font-bold text-gray-900">{String(activeTickets.length).padStart(2, '0')}</p>
        </div>
        <div className="bg-[#f8fafc] border border-[#f1f5f9] p-6 rounded-[1.5rem]">
          <h3 className="text-[11px] font-bold text-gray-500 tracking-widest mb-3">Pending Bookings</h3>
          <p className="text-2xl font-bold text-gray-900">{String(pendingBookings.length).padStart(2, '0')}</p>
        </div>
        <div className="bg-[#f8fafc] border border-[#f1f5f9] p-6 rounded-[1.5rem]">
          <h3 className="text-[11px] font-bold text-gray-500 tracking-widest mb-3">Resolved</h3>
          <p className="text-2xl font-bold text-gray-900">{String(resolvedToday.length).padStart(2, '0')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Pending Bookings */}
          {pendingBookings.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-900 tracking-wide mb-4">Pending Booking Approvals</h2>
              <div className="space-y-3">
                {pendingBookings.map((b) => (
                  <div key={b.id} className="bg-amber-50/50 p-5 rounded-[1.5rem] border border-amber-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{getEquipmentName(b.equipmentId)}</h3>
                      <p className="text-[11px] font-semibold text-gray-500 mt-1">Requested by {getUserName(b.userId)} · Due: {b.dueDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApproveBooking(b.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold">Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDenyBooking(b.id)} className="rounded-full text-xs font-bold border-red-200 text-red-500 hover:bg-red-50">Deny</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Queue */}
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-sm font-bold text-gray-900 tracking-wide">Ticket Queue</h2>
            <div className="flex items-center gap-2 bg-emerald-50/50 text-emerald-600 px-3 py-1 rounded-sm border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Updates
            </div>
          </div>
          <div className="space-y-4">
            {tickets.map((t) => (
              <div key={t.id} className="bg-[#f8fafc] p-7 rounded-[1.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm ${priorityColor[t.priority]}`}>{t.priority}</span>
                  <span className={`text-[10px] font-bold uppercase ${statusColor[t.status]}`}>{t.status.replace('-', ' ')}</span>
                </div>
                <h3 className="font-bold text-base text-gray-900 tracking-tight">{t.title}</h3>
                <p className="text-[11px] font-semibold text-gray-500 mt-1 mb-8">{t.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><MapPin className="h-3.5 w-3.5 text-gray-400" /> {t.lab}</div>
                    <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest"><UserCircle className="h-3.5 w-3.5" /> {getUserName(t.userId)}</div>
                  </div>
                  {t.status !== 'resolved' && (
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleEscalate(t.id)} className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider">Escalate</button>
                      <button onClick={() => handleResolve(t.id)} className="bg-[#164ac9] text-white text-[10px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow hover:bg-blue-800 transition-all">Resolve</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panels */}
        <div className="col-span-1 space-y-6 pt-10">
          <div className="bg-[#f8fafc] border border-gray-100 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#164ac9]" />
              <h3 className="font-bold text-[12px] text-gray-900">Functional Requirements</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[10px] font-semibold text-gray-500"><span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" /> View real-time incoming report queue</li>
              <li className="flex items-start gap-2 text-[10px] font-semibold text-gray-500"><span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" /> Update ticket status</li>
              <li className="flex items-start gap-2 text-[10px] font-semibold text-gray-500"><span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" /> Approve/Deny booking requests</li>
            </ul>
          </div>
          <div className="bg-[#f8fafc] border border-gray-100 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-3.5 w-3.5 text-[#164ac9]" />
              <h3 className="font-bold text-[12px] text-gray-900">Non-Functional Requirements</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[10px] font-semibold text-gray-500"><span className="mt-1.5 w-1 h-1 rounded-full bg-[#164ac9] flex-shrink-0" /> Real-time queue updates</li>
              <li className="flex items-start gap-2 text-[10px] font-semibold text-gray-500"><span className="mt-1.5 w-1 h-1 rounded-full bg-[#164ac9] flex-shrink-0" /> Reliable state transitions</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-[#164ac9] to-[#0f3493] rounded-3xl p-7 text-white shadow-xl shadow-blue-900/30">
            <h3 className="font-bold text-sm mb-6">System Health</h3>
            <div className="flex items-center justify-between text-[11px] font-bold text-white/50">
              <span>Core infrastructure</span>
              <span className="text-white font-black text-sm">99.2%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-white w-[99%] h-full rounded-full" />
            </div>
            <Button className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-5 mt-5 text-[11px] uppercase tracking-wider rounded-xl border border-white/10">
              <Activity className="h-4 w-4 mr-2" /> Generate Shift Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
