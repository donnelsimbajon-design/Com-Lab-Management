"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { hasPermission } from '@/lib/security/rbac';
import { toast } from 'sonner';
import { Activity, TrendingUp, Calendar, Wallet, Clock, Download, RefreshCw, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalyticsReports() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const bookings = useAppStore((s) => s.bookings);
  const equipment = useAppStore((s) => s.equipment);
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const softwareRequests = useAppStore((s) => s.softwareRequests);
  const labs = useAppStore((s) => s.labs);
  const role = currentUser?.role;
  const canApprove = hasPermission(role, 'software:approve');

  const updateSoftwareRequestStatus = useAppStore((s) => s.updateSoftwareRequestStatus);

  const totalLabHours = 1000 + bookings.filter((b) => b.status === 'approved' || b.status === 'completed').length * 80;
  const activeBookings = bookings.filter((b) => b.status === 'approved' || b.status === 'pending').length;
  const eqROI = equipment.length ? Math.round((equipment.filter((e) => e.status !== 'maintenance').length / equipment.length) * 1000) / 10 : 0;
  const openTickets = tickets.filter((t) => t.status !== 'resolved').length;
  const pendingSW = softwareRequests.filter((r) => r.status === 'pending');

  const handleApproveSW = (id: string) => {
    if (!canApprove) return;
    updateSoftwareRequestStatus(id, 'approved');
    logAudit('SOFTWARE_APPROVED', currentUser?.id || '', currentUser?.name || '', role || '', `Approved software ${id}`);
    toast.success('Software approved!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">System Analytics</h1><p className="text-sm text-gray-500 mt-1">Real-time insights from centralized data.</p></div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl text-xs font-bold h-10"><Download className="h-3.5 w-3.5 mr-2" /> Export</Button>
          <Button onClick={() => toast.info('Refreshed!')} className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-xl text-xs font-bold h-10 shadow-md"><RefreshCw className="h-3.5 w-3.5 mr-2" /> Refresh</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Lab Usage', value: `${totalLabHours.toLocaleString()} hrs`, icon: <Activity className="h-4 w-4 text-gray-400" />, trend: '+12%', trendColor: 'text-emerald-600' },
          { label: 'Active Bookings', value: activeBookings, icon: <Calendar className="h-4 w-4 text-gray-400" />, trend: 'Live', trendColor: 'text-emerald-600' },
          { label: 'Equipment ROI', value: `${eqROI}%`, icon: <Wallet className="h-4 w-4 text-gray-400" />, trend: 'Active ratio', trendColor: 'text-emerald-600' },
          { label: 'Open Tickets', value: openTickets, icon: <Clock className="h-4 w-4 text-gray-400" />, trend: `${tickets.filter((t) => t.priority === 'high').length} critical`, trendColor: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
            <div className="absolute right-5 top-5">{s.icon}</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${s.trendColor}`}><TrendingUp className="h-3 w-3" /> {s.trend}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2">
          {pendingSW.length > 0 && (
            <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-6">
              <h2 className="font-bold text-sm text-gray-900 mb-4">Pending Software ({pendingSW.length})</h2>
              <div className="space-y-3">{pendingSW.map((r) => { const t = users.find((u) => u.id === r.teacherId); return (
                <div key={r.id} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
                  <div><h3 className="font-bold text-sm text-gray-900">{r.softwareName}</h3><p className="text-[10px] text-gray-500 mt-0.5">By {t?.name || 'Unknown'} · {r.lab}</p></div>
                  {canApprove ? <Button size="sm" onClick={() => handleApproveSW(r.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold">Approve</Button> : <Lock className="h-4 w-4 text-gray-300" />}
                </div>
              ); })}</div>
            </div>
          )}
        </div>
        <div className="col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-bold text-sm text-gray-900 mb-4">Users by Role</h2>
            {(['student', 'teacher', 'sa', 'admin'] as const).map((r) => {
              const count = users.filter((u) => u.role === r).length;
              const colors: Record<string, string> = { student: 'bg-blue-500', teacher: 'bg-amber-500', sa: 'bg-emerald-500', admin: 'bg-gray-800' };
              return (<div key={r} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"><div className="flex items-center gap-3"><div className={`w-2.5 h-2.5 rounded-full ${colors[r]}`} /><span className="text-xs font-bold text-gray-700 capitalize">{r}</span></div><span className="text-sm font-black text-gray-900">{count}</span></div>);
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
