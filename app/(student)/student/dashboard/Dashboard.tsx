"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { hasPermission } from '@/lib/security/rbac';
import { toast } from 'sonner';
import { Calendar, Monitor, Activity, CheckCircle2, Shield, AlertCircle, CalendarClock, Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const bookings = useAppStore((s) => s.bookings);
  const equipment = useAppStore((s) => s.equipment);
  const labs = useAppStore((s) => s.labs);
  const tickets = useAppStore((s) => s.tickets);
  const createTicket = useAppStore((s) => s.createTicket);

  const userId = currentUser?.id || '';
  const userName = currentUser?.name?.split(' ')[0] || 'Student';
  const role = currentUser?.role;
  const canCreateTicket = hasPermission(role, 'ticket:create');

  const myBookings = bookings.filter((b) => b.userId === userId);
  const borrowedBookings = myBookings.filter((b) => b.status === 'approved');
  const pendingBookings = myBookings.filter((b) => b.status === 'pending');
  const avgCapacity = labs.length ? Math.round(labs.reduce((a, l) => a + (l.occupiedUnits / l.totalUnits) * 100, 0) / labs.length) : 0;

  const handleReportIssue = () => {
    if (!canCreateTicket) { toast.error('Unauthorized.'); return; }
    createTicket({ userId, type: 'incident', title: 'Equipment Issue', description: 'Reporting an issue with lab equipment.', status: 'open', priority: 'medium', lab: 'Lab 1' });
    logAudit('TICKET_CREATED', userId, currentUser?.name || '', role || '', 'Reported equipment issue');
    toast.success('Issue reported!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening in the labs today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Borrowed Items', value: borrowedBookings.length, sub: `${pendingBookings.length} pending approval`, icon: <Monitor className="h-4 w-4 text-blue-500" /> },
          { label: 'Active Bookings', value: myBookings.filter((b) => b.status !== 'completed' && b.status !== 'denied').length, sub: `${borrowedBookings.length} currently active`, icon: <Calendar className="h-4 w-4 text-emerald-500" /> },
          { label: 'Lab Capacity', value: `${avgCapacity}%`, sub: 'Average across labs', icon: <Activity className="h-4 w-4 text-orange-500" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</h3>
              {stat.icon}
            </div>
            <p className="text-4xl font-bold text-gray-900">{String(stat.value).padStart(2, '0')}</p>
            <p className="text-xs font-medium text-gray-500 mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Live Lab Status</h2>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {labs.map((lab) => {
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
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isAlmostFull ? 'text-red-500' : 'text-emerald-600'}`}>{isAlmostFull ? 'Almost Full' : 'Available'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4"><CheckCircle2 className="h-5 w-5 text-blue-600" /><h3 className="font-bold text-sm text-slate-800">Quick Stats</h3></div>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-xs font-medium text-slate-600"><span>Total equipment</span><span className="font-bold text-gray-900">{equipment.length}</span></li>
              <li className="flex items-center justify-between text-xs font-medium text-slate-600"><span>Available now</span><span className="font-bold text-emerald-600">{equipment.filter((e) => e.status === 'available').length}</span></li>
              <li className="flex items-center justify-between text-xs font-medium text-slate-600"><span>Open tickets</span><span className="font-bold text-amber-600">{tickets.filter((t) => t.status !== 'resolved').length}</span></li>
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
