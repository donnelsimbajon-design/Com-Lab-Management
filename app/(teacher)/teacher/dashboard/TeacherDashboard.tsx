"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { hasPermission } from '@/lib/security/rbac';
import { sanitizeInput, containsScriptInjection } from '@/lib/security/sanitize';
import { toast } from 'sonner';
import { GraduationCap, Settings2, BarChart3, Bug, Plus, Send, Lock, Bell, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TeacherDashboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const tickets = useAppStore((s) => s.tickets);
  const softwareRequests = useAppStore((s) => s.softwareRequests);
  const labs = useAppStore((s) => s.labs);
  const schedules = useAppStore((s) => s.schedules);
  const createTicket = useAppStore((s) => s.createTicket);
  const createReport = useAppStore((s) => s.createReport);
  const createSoftwareRequest = useAppStore((s) => s.createSoftwareRequest);

  const userId = currentUser?.id || '';
  const userName = currentUser?.name || 'Teacher';
  const role = currentUser?.role;
  const canCreateReport = hasPermission(role, 'report:create');
  const canCreateSoftware = hasPermission(role, 'software:create');

  const mySchedules = schedules.filter((s) => s.teacherId === userId);
  const myRequests = softwareRequests.filter((r) => r.teacherId === userId);
  const myTickets = tickets.filter((t) => t.userId === userId);
  const avgUtilization = labs.length ? Math.round(labs.reduce((a, l) => a + (l.occupiedUnits / l.totalUnits) * 100, 0) / labs.length) : 0;

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');

  const handleNewReport = () => {
    if (!canCreateReport) { toast.error('Unauthorized.'); return; }
    if (containsScriptInjection(reportTitle)) { toast.error('Invalid input.'); return; }
    const title = sanitizeInput(reportTitle); const desc = sanitizeInput(reportDesc);
    if (!title || title.length < 3) { toast.error('Title must be at least 3 characters.'); return; }
    createTicket({ userId, type: 'incident', title, description: desc || 'No description.', status: 'open', priority: 'medium', lab: mySchedules[0]?.lab || 'Lab 1' });
    createReport({ teacherId: userId, title, description: desc });
    logAudit('REPORT_SUBMITTED', userId, userName, role || '', `Report: ${title}`);
    toast.success('Report submitted!');
    setReportTitle(''); setReportDesc(''); setShowReportForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1><p className="text-sm text-gray-500 mt-1">Welcome, {userName.split(' ')[0]}!</p></div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-xl border-gray-200 h-10 w-10"><Bell className="h-4 w-4 text-gray-500" /></Button>
          {canCreateReport ? (
            <Button onClick={() => setShowReportForm(!showReportForm)} className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-xl px-5 font-bold shadow-md h-10"><Plus className="h-4 w-4 mr-2" /> New Report</Button>
          ) : <Button disabled className="rounded-xl px-5 font-bold h-10 opacity-50"><Lock className="h-4 w-4 mr-2" /> No Permission</Button>}
        </div>
      </div>

      {showReportForm && canCreateReport && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top duration-300">
          <Input placeholder="Report title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} className="rounded-xl" />
          <Input placeholder="Description (optional)" value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} className="rounded-xl" />
          <div className="flex gap-3">
            <Button onClick={handleNewReport} className="bg-[#164ac9] text-white rounded-xl font-bold"><Send className="h-4 w-4 mr-2" /> Submit</Button>
            <Button variant="outline" onClick={() => setShowReportForm(false)} className="rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Classes</p><GraduationCap className="h-4 w-4 text-gray-500" /></div>
          <p className="text-3xl font-bold text-gray-900">{String(mySchedules.length).padStart(2, '0')}</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">{mySchedules.filter((s) => s.status === 'ongoing').length} labs in use</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Software Reqs</p><Settings2 className="h-4 w-4 text-gray-500" /></div>
          <p className="text-3xl font-bold text-gray-900">{String(myRequests.length).padStart(2, '0')}</p>
          <p className="text-[10px] font-bold text-amber-500 mt-1">{myRequests.filter((r) => r.status === 'pending').length} pending</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lab Utilization</p><BarChart3 className="h-4 w-4 text-gray-500" /></div>
          <p className="text-3xl font-bold text-gray-900">{avgUtilization}%</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">Across all labs</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reported Issues</p><Bug className="h-4 w-4 text-gray-500" /></div>
          <p className="text-3xl font-bold text-gray-900">{String(myTickets.length).padStart(2, '0')}</p>
          <p className="text-[10px] font-bold text-red-500 mt-1">{myTickets.filter((t) => t.status === 'open').length} open</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-900">Today&apos;s Schedule</h2>
            <span className="px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-500">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {mySchedules.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No classes scheduled.</div>
            ) : mySchedules.map((s) => (
              <div key={s.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${s.status === 'ongoing' ? 'bg-[#164ac9]' : 'bg-gray-200'}`} />
                <div className="pl-4">
                  <h3 className="font-bold text-gray-900">{s.subject}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium"><Clock className="h-3 w-3" /> {s.time}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium"><MapPin className="h-3 w-3" /> {s.lab}</span>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border ${s.status === 'ongoing' ? 'bg-blue-50 text-[#164ac9] border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{s.status === 'ongoing' ? 'Ongoing' : 'Upcoming'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-900">Software Requests</h2>
            {canCreateSoftware && <span className="text-xs text-blue-500 font-bold cursor-pointer hover:underline">View All</span>}
          </div>
          <div className="divide-y divide-gray-50">
            {myRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No requests.</div>
            ) : myRequests.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg"><Settings2 className="h-4 w-4 text-[#164ac9]" /></div>
                  <div><p className="font-semibold text-sm text-gray-900">{r.softwareName}</p><p className="text-[10px] text-gray-500">For {r.lab}</p></div>
                </div>
                {r.status === 'approved' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">{r.status}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
