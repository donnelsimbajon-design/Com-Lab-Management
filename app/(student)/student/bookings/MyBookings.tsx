"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { toast } from 'sonner';
import { Calendar, Clock, CheckCircle2, XCircle, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyBookings() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const bookings = useAppStore((s) => s.bookings);
  const equipment = useAppStore((s) => s.equipment);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);

  const userId = currentUser?.id || '';
  const myBookings = bookings.filter((b) => b.userId === userId);
  const getEquipment = (id: string) => equipment.find((e) => e.id === id);

  const handleReturn = (bookingId: string) => {
    updateBookingStatus(bookingId, 'completed');
    logAudit('BOOKING_COMPLETED', userId, currentUser?.name || '', currentUser?.role || '', `Returned booking ${bookingId}`);
    toast.success('Equipment returned!');
  };

  const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    pending: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    approved: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    denied: { icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
    completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  };

  const grouped = {
    active: myBookings.filter((b) => b.status === 'approved'),
    pending: myBookings.filter((b) => b.status === 'pending'),
    past: myBookings.filter((b) => b.status === 'completed' || b.status === 'denied'),
  };

  const renderSection = (title: string, items: typeof myBookings, showReturn: boolean) => items.length > 0 && (
    <div>
      <h2 className="text-sm font-bold text-gray-900 tracking-wide mb-4">{title}</h2>
      <div className="space-y-3">
        {items.map((b) => {
          const eq = getEquipment(b.equipmentId);
          const cfg = STATUS_CONFIG[b.status];
          return (
            <div key={b.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${b.status === 'approved' ? 'bg-blue-50' : b.status === 'pending' ? 'bg-amber-50' : 'bg-gray-100'}`}><Package className={`h-5 w-5 ${b.status === 'approved' ? 'text-blue-600' : b.status === 'pending' ? 'text-amber-600' : 'text-gray-400'}`} /></div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{eq?.name || 'Unknown'}</h3>
                  <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{eq?.category} · {eq?.lab}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500"><Calendar className="h-3 w-3" /> Due: {b.dueDate}</span>
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.icon} {b.status}</span>
                  </div>
                </div>
              </div>
              {showReturn && <Button size="sm" variant="outline" onClick={() => handleReturn(b.id)} className="rounded-full text-xs font-bold">Return</Button>}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div><h1 className="text-2xl font-bold text-gray-900">My Bookings</h1><p className="text-sm text-gray-500 mt-1">Track your equipment booking requests and returns.</p></div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p><p className="text-2xl font-bold text-gray-900 mt-1">{myBookings.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p><p className="text-2xl font-bold text-blue-600 mt-1">{grouped.active.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p><p className="text-2xl font-bold text-amber-600 mt-1">{grouped.pending.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed</p><p className="text-2xl font-bold text-emerald-600 mt-1">{grouped.past.length}</p></div>
      </div>
      {renderSection('Active Borrowings', grouped.active, true)}
      {renderSection('Pending Approval', grouped.pending, false)}
      {renderSection('History', grouped.past, false)}
      {myBookings.length === 0 && <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><Clock className="h-8 w-8 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-400 font-medium">No bookings yet.</p></div>}
    </div>
  );
}
