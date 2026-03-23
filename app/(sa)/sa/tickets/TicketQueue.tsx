"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { hasPermission } from '@/lib/security/rbac';
import { toast } from 'sonner';
import { Search, AlertTriangle, ArrowUpRight, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TicketQueue() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const bookings = useAppStore((s) => s.bookings);
  const equipment = useAppStore((s) => s.equipment);
  const updateTicketStatus = useAppStore((s) => s.updateTicketStatus);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);
  const role = currentUser?.role;
  const canUpdateTicket = hasPermission(role, 'ticket:update');
  const canApproveBooking = hasPermission(role, 'booking:approve');

  const [search, setSearch] = useState('');
  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'Unknown';
  const getEqName = (id: string) => equipment.find((e) => e.id === id)?.name || 'Unknown';

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const filteredTickets = tickets.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.lab.toLowerCase().includes(search.toLowerCase()));

  const handleResolve = (id: string, title: string) => {
    if (!canUpdateTicket) { toast.error('Unauthorized.'); return; }
    updateTicketStatus(id, 'resolved');
    logAudit('TICKET_RESOLVED', currentUser?.id || '', currentUser?.name || '', role || '', `Resolved: ${title}`);
    toast.success(`"${title}" resolved!`);
  };

  const handleEscalate = (id: string, title: string) => {
    if (!canUpdateTicket) { toast.error('Unauthorized.'); return; }
    updateTicketStatus(id, 'in-progress');
    logAudit('TICKET_ESCALATED', currentUser?.id || '', currentUser?.name || '', role || '', `Escalated: ${title}`);
    toast.info(`"${title}" escalated.`);
  };

  const handleApprove = (id: string) => {
    if (!canApproveBooking) { toast.error('Unauthorized.'); return; }
    updateBookingStatus(id, 'approved');
    logAudit('BOOKING_APPROVED', currentUser?.id || '', currentUser?.name || '', role || '', `Approved booking ${id}`);
    toast.success('Booking approved!');
  };

  const handleDeny = (id: string) => {
    if (!canApproveBooking) { toast.error('Unauthorized.'); return; }
    updateBookingStatus(id, 'denied');
    logAudit('BOOKING_DENIED', currentUser?.id || '', currentUser?.name || '', role || '', `Denied booking ${id}`);
    toast.error('Booking denied.');
  };

  const PRIORITY_COLORS: Record<string, string> = { high: 'text-red-600 bg-red-50', medium: 'text-gray-600 bg-gray-100', low: 'text-gray-500 bg-gray-50' };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Ticket Queue</h1><p className="text-sm text-gray-500 mt-1">Manage tickets and booking approvals.</p></div>
        <div className="relative w-64"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Tickets</p><p className="text-2xl font-bold text-gray-900 mt-1">{tickets.filter((t) => t.status !== 'resolved').length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Bookings</p><p className="text-2xl font-bold text-amber-600 mt-1">{pendingBookings.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolved</p><p className="text-2xl font-bold text-emerald-600 mt-1">{tickets.filter((t) => t.status === 'resolved').length}</p></div>
      </div>

      {pendingBookings.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-4">Pending Booking Approvals</h2>
          <div className="space-y-3">{pendingBookings.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div><h3 className="font-bold text-sm text-gray-900">{getEqName(b.equipmentId)}</h3><p className="text-[10px] text-gray-500 font-semibold mt-0.5">Requested by {getUserName(b.userId)} · Due: {b.dueDate}</p></div>
              {canApproveBooking ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(b.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold">Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeny(b.id)} className="rounded-full text-xs font-bold text-red-500 border-red-200 hover:bg-red-50">Deny</Button>
                </div>
              ) : <Lock className="h-4 w-4 text-gray-300" />}
            </div>
          ))}</div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-4">Ticket Queue</h2>
        <div className="space-y-3">
          {filteredTickets.filter((t) => t.status !== 'resolved').map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${t.status === 'open' ? 'text-amber-500' : 'text-blue-500'}`}>{t.status}</span>
              </div>
              <h3 className="font-bold text-sm text-gray-900">{t.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{t.description}</p>
              <p className="text-[10px] text-gray-400 mt-2">{t.lab} · {getUserName(t.userId)} · {t.createdAt}</p>
              {canUpdateTicket ? (
                <div className="flex gap-2 mt-4">
                  {t.status === 'open' && <Button size="sm" variant="outline" onClick={() => handleEscalate(t.id, t.title)} className="rounded-full text-xs font-bold text-amber-600 border-amber-200"><ArrowUpRight className="h-3 w-3 mr-1" /> Escalate</Button>}
                  <Button size="sm" onClick={() => handleResolve(t.id, t.title)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold"><CheckCircle2 className="h-3 w-3 mr-1" /> Resolve</Button>
                </div>
              ) : <div className="mt-4 text-[10px] text-gray-400 font-bold flex items-center gap-1"><Lock className="h-3 w-3" /> Read-only</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
