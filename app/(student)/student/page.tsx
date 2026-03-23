"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { hasPermission } from '@/lib/security/rbac';
import { sanitizeInput, containsScriptInjection } from '@/lib/security/sanitize';
import { validate, ticketSchema } from '@/lib/security/validation';
import { toast } from 'sonner';
import { Calendar, Monitor, Activity, CheckCircle2, Shield, AlertCircle, CalendarClock, Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentDashboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const bookings = useAppStore((s) => s.bookings);
  const equipment = useAppStore((s) => s.equipment);
  const labs = useAppStore((s) => s.labs);
  const createBooking = useAppStore((s) => s.createBooking);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);
  const createTicket = useAppStore((s) => s.createTicket);

  const userId = currentUser?.id || 'u1';
  const userName = currentUser?.name?.split(' ')[0] || 'Student';
  const role = currentUser?.role;

  // RBAC checks
  const canBorrow = hasPermission(role, 'booking:create');
  const canCreateTicket = hasPermission(role, 'ticket:create');

  // Derived data
  const myBookings = bookings.filter((b) => b.userId === userId);
  const borrowedBookings = myBookings.filter((b) => b.status === 'approved');
  const pendingBookings = myBookings.filter((b) => b.status === 'pending');
  const borrowedEquipment = borrowedBookings.map((b) => ({
    ...b,
    equipment: equipment.find((e) => e.id === b.equipmentId),
  }));
  const availableEquipment = equipment.filter((e) => e.status === 'available');
  const avgCapacity = labs.length
    ? Math.round(labs.reduce((acc, l) => acc + (l.occupiedUnits / l.totalUnits) * 100, 0) / labs.length)
    : 0;

  const [showBorrowModal, setShowBorrowModal] = useState(false);

  const handleBorrow = (eqId: string) => {
    if (!canBorrow) { toast.error('Unauthorized action.'); return; }
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    createBooking(userId, eqId, dueDate.toISOString().split('T')[0]);
    logAudit('BOOKING_CREATED', userId, currentUser?.name || '', role || '', `Requested equipment ${eqId}`);
    toast.success('Borrow request submitted! Waiting for SA approval.');
  };

  const handleReturn = (bookingId: string) => {
    updateBookingStatus(bookingId, 'completed');
    logAudit('BOOKING_COMPLETED', userId, currentUser?.name || '', role || '', `Returned booking ${bookingId}`);
    toast.success('Equipment returned successfully!');
  };

  const handleReportIssue = () => {
    if (!canCreateTicket) { toast.error('Unauthorized action.'); return; }
    createTicket({
      userId,
      type: 'incident',
      title: 'Equipment Issue',
      description: 'Reporting an issue with lab equipment.',
      status: 'open',
      priority: 'medium',
      lab: 'Lab 1',
    });
    logAudit('TICKET_CREATED', userId, currentUser?.name || '', role || '', 'Reported equipment issue');
    toast.success('Issue reported! SA has been notified.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening in the labs today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Borrowed Items</h3>
            <Monitor className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{String(borrowedBookings.length).padStart(2, '0')}</p>
          <p className="text-xs font-medium text-gray-500 mt-2">{pendingBookings.length} pending approval</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Bookings</h3>
            <Calendar className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{String(myBookings.filter((b) => b.status !== 'completed' && b.status !== 'denied').length).padStart(2, '0')}</p>
          <p className="text-xs font-medium text-gray-500 mt-2">{borrowedBookings.length} currently active</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lab Capacity</h3>
            <Activity className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{avgCapacity}%</p>
          <p className="text-xs font-medium text-gray-500 mt-2">Average across labs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          {/* Live Lab Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Live Lab Status</h2>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {labs.slice(0, 5).map((lab) => {
                const available = lab.totalUnits - lab.occupiedUnits;
                const isAlmostFull = available <= 3;
                return (
                  <div key={lab.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1.5 w-2 h-2 rounded-full ${isAlmostFull ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">{lab.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{lab.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{available} <span className="text-gray-400 font-medium">/ {lab.totalUnits}</span></span>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isAlmostFull ? 'text-red-500' : 'text-emerald-600'}`}>
                        {isAlmostFull ? 'Almost Full' : 'Available'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Borrowed Equipment */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Borrowed Equipment</h2>
              {canBorrow ? (
                <Button size="sm" variant="outline" className="rounded-full text-xs font-bold" onClick={() => setShowBorrowModal(!showBorrowModal)}>
                  <Plus className="h-3 w-3 mr-1" /> Borrow
                </Button>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold"><Lock className="h-3 w-3" /> No permission</span>
              )}
            </div>

            {showBorrowModal && canBorrow && (
              <div className="p-6 bg-blue-50/30 border-b border-blue-100/50 space-y-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Available Equipment</p>
                {availableEquipment.length === 0 ? (
                  <p className="text-sm text-gray-500">No equipment available right now.</p>
                ) : (
                  availableEquipment.map((eq) => (
                    <div key={eq.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{eq.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{eq.lab} · {eq.category}</p>
                      </div>
                      <Button size="sm" className="bg-[#164ac9] hover:bg-blue-800 rounded-full text-xs" onClick={() => handleBorrow(eq.id)}>
                        Request
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="p-6 space-y-4">
              {borrowedEquipment.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No borrowed equipment.</p>
              ) : (
                borrowedEquipment.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100"><Monitor className="h-5 w-5 text-gray-600" /></div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">{item.equipment?.name}</h4>
                        <p className="text-xs font-semibold text-red-500 mt-1">Due: {item.dueDate}</p>
                      </div>
                    </div>
                    <button onClick={() => handleReturn(item.id)} className="px-4 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-full transition-colors">Return</button>
                  </div>
                ))
              )}
              {pendingBookings.length > 0 && (
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Pending Approval</p>
                  {pendingBookings.map((b) => {
                    const eq = equipment.find((e) => e.id === b.equipmentId);
                    return (
                      <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/30 border border-amber-100/50">
                        <p className="text-sm font-semibold text-gray-700">{eq?.name || 'Unknown'}</p>
                        <span className="text-[10px] font-bold text-amber-600 uppercase">Pending</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 space-y-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-800">Functional Requirements</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-xs font-medium text-slate-600"><CheckCircle2 className="h-3 w-3 text-slate-400" /> View real-time lab availability</li>
              <li className="flex items-center gap-3 text-xs font-medium text-slate-600"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Track borrowed equipment</li>
              <li className="flex items-center gap-3 text-xs font-medium text-slate-600"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Monitor due dates</li>
              <li className="flex items-center gap-3 text-xs font-medium text-slate-600"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Access personal booking status</li>
            </ul>
          </div>
          <div className="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-amber-600" />
              <h3 className="font-bold text-sm text-amber-900">Non-Functional Req.</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-xs font-medium text-amber-800/70"><Activity className="h-3 w-3 text-amber-600/50" /> Real-time updates (&lt;1s delay)</li>
              <li className="flex items-center gap-3 text-xs font-medium text-amber-800/70"><Monitor className="h-3 w-3 text-amber-600/50" /> Responsive desktop layout</li>
              <li className="flex items-center gap-3 text-xs font-medium text-amber-800/70"><AlertCircle className="h-3 w-3 text-amber-600/50" /> RBAC enforced on all actions</li>
              <li className="flex items-center gap-3 text-xs font-medium text-amber-800/70"><CalendarClock className="h-3 w-3 text-amber-600/50" /> JWT session management</li>
            </ul>
          </div>
          {canCreateTicket ? (
            <Button onClick={handleReportIssue} variant="outline" className="w-full rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50">
              <AlertCircle className="h-4 w-4 mr-2" /> Report an Issue
            </Button>
          ) : (
            <Button disabled variant="outline" className="w-full rounded-xl font-bold border-gray-200 text-gray-400 cursor-not-allowed">
              <Lock className="h-4 w-4 mr-2" /> Report (No Permission)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
