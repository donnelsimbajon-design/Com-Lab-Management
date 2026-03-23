"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { hasPermission } from '@/lib/security/rbac';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Lock, Package, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BookingRequests() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const bookings = useAppStore((s) => s.bookings);
  const equipment = useAppStore((s) => s.equipment);
  const users = useAppStore((s) => s.users);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);
  const role = currentUser?.role;
  const canApprove = hasPermission(role, 'booking:approve');
  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'Unknown';
  const getEq = (id: string) => equipment.find((e) => e.id === id);

  const pending = bookings.filter((b) => b.status === 'pending');
  const active = bookings.filter((b) => b.status === 'approved');
  const history = bookings.filter((b) => b.status === 'completed' || b.status === 'denied');

  const handleApprove = (id: string) => {
    if (!canApprove) return;
    updateBookingStatus(id, 'approved');
    logAudit('BOOKING_APPROVED', currentUser?.id || '', currentUser?.name || '', role || '', `Approved ${id}`);
    toast.success('Approved!');
  };
  const handleDeny = (id: string) => {
    if (!canApprove) return;
    updateBookingStatus(id, 'denied');
    logAudit('BOOKING_DENIED', currentUser?.id || '', currentUser?.name || '', role || '', `Denied ${id}`);
    toast.error('Denied.');
  };

  const STATUS_BADGE: Record<string, string> = { pending: 'text-amber-600 bg-amber-50 border-amber-100', approved: 'text-blue-600 bg-blue-50 border-blue-100', completed: 'text-emerald-600 bg-emerald-50 border-emerald-100', denied: 'text-red-600 bg-red-50 border-red-100' };

  const renderList = (title: string, items: typeof bookings, showActions: boolean) => items.length > 0 && (
    <div>
      <h2 className="text-sm font-bold text-gray-900 mb-4">{title} ({items.length})</h2>
      <div className="space-y-3">{items.map((b) => { const eq = getEq(b.equipmentId); return (
        <div key={b.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl"><Package className="h-5 w-5 text-blue-600" /></div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">{eq?.name || 'Unknown'}</h3>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{getUserName(b.userId)} · {eq?.lab}</p>
              <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium mt-1"><Calendar className="h-3 w-3" /> Due: {b.dueDate}</span>
            </div>
          </div>
          {showActions && canApprove ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleApprove(b.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold"><CheckCircle2 className="h-3 w-3 mr-1" /> Approve</Button>
              <Button size="sm" variant="outline" onClick={() => handleDeny(b.id)} className="rounded-full text-xs font-bold text-red-500 border-red-200 hover:bg-red-50"><XCircle className="h-3 w-3 mr-1" /> Deny</Button>
            </div>
          ) : showActions ? <Lock className="h-4 w-4 text-gray-300" /> : (
            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${STATUS_BADGE[b.status]}`}>{b.status}</span>
          )}
        </div>
      ); })}</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div><h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1><p className="text-sm text-gray-500 mt-1">Review and manage equipment borrowing requests.</p></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p><p className="text-2xl font-bold text-amber-600 mt-1">{pending.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p><p className="text-2xl font-bold text-blue-600 mt-1">{active.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed</p><p className="text-2xl font-bold text-emerald-600 mt-1">{history.length}</p></div>
      </div>
      {renderList('Pending Approval', pending, true)}
      {renderList('Active Borrowings', active, false)}
      {renderList('History', history, false)}
      {bookings.length === 0 && <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><p className="text-sm text-gray-400">No bookings.</p></div>}
    </div>
  );
}
