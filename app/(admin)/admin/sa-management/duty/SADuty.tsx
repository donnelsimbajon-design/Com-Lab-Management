"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Users, Clock, MapPin, Printer, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SADuty() {
  const saAssignments = useAppStore((s) => s.saAssignments);
  const openLabSlots = useAppStore((s) => s.openLabSlots);
  const teacherLabReports = useAppStore((s) => s.teacherLabReports);
  const users = useAppStore((s) => s.users);

  const [showReports, setShowReports] = useState(false);

  const now = new Date();
  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Build duty status for each lab
  const labDutyStatus = Array.from({ length: 9 }, (_, i) => {
    const labId = i + 1;
    const sa = saAssignments.find((a) => a.isActive && a.labIds.includes(labId));
    const todaySlots = openLabSlots.filter((s) => s.labId === labId && s.day === todayName);
    const isWithinSchedule = todaySlots.some((s) => currentTime >= s.startTime && currentTime <= s.endTime);
    const isOnDuty = !!sa && (todaySlots.length === 0 || isWithinSchedule);
    return { labId, sa, todaySlots, isOnDuty };
  });

  const activeDutyCount = labDutyStatus.filter((l) => l.isOnDuty).length;

  const handlePrintReports = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>SA Duty Reports</title><style>body{font-family:'Segoe UI',sans-serif;padding:40px;color:#111}h1{font-size:20px}p.sub{font-size:12px;color:#666;margin-bottom:24px}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}th{background:#f3f4f6;text-align:left;padding:10px;font-size:10px;text-transform:uppercase;border-bottom:2px solid #e5e7eb}td{padding:8px 10px;border-bottom:1px solid #f3f4f6}.footer{margin-top:40px;font-size:10px;color:#999}</style></head><body>
    <h1>SA Duty Report</h1>
    <p class="sub">Generated: ${now.toLocaleString()} · ComLab Connect FSUU</p>
    <h2 style="font-size:14px;margin-top:24px">Current Duty Status</h2>
    <table><thead><tr><th>Lab</th><th>Assigned SA</th><th>Status</th><th>Today's Hours</th></tr></thead><tbody>
    ${labDutyStatus.map((l) => `<tr><td>Lab ${l.labId}</td><td>${l.sa?.saName || '—'}</td><td>${l.isOnDuty ? 'ON DUTY' : l.sa ? 'Off Hours' : 'Unassigned'}</td><td>${l.todaySlots.map((s) => `${s.startTime}–${s.endTime}`).join(', ') || '—'}</td></tr>`).join('')}
    </tbody></table>
    <h2 style="font-size:14px;margin-top:32px">Teacher Lab Reports (${teacherLabReports.length})</h2>
    <table><thead><tr><th>Teacher</th><th>Lab</th><th>Title</th><th>SA on Duty</th><th>Submitted</th></tr></thead><tbody>
    ${teacherLabReports.map((r) => `<tr><td>${r.teacherName}</td><td>${r.labName}</td><td>${r.title}</td><td>${r.saName || 'None'}</td><td>${new Date(r.submittedAt).toLocaleString()}</td></tr>`).join('')}
    </tbody></table>
    <p class="footer">Total labs: 9 · Active duty: ${activeDutyCount} · Reports: ${teacherLabReports.length}</p>
    </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">S.A. Duty</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Monitor which Student Assistants are on duty right now.
            <span className="ml-2 text-gray-400">
              {todayName}, {now.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <Button variant="outline" onClick={handlePrintReports} className="rounded-xl font-bold gap-2">
          <Printer className="h-4 w-4" /> Print Full Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Labs with SA</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{labDutyStatus.filter((l) => l.sa).length}</p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-sm">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Currently On Duty</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{activeDutyCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Teacher Reports</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{teacherLabReports.length}</p>
        </div>
      </div>

      {/* Duty Grid */}
      <div className="bg-[#f8fafc] border border-gray-100 rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-6">Real-Time Duty Status</h2>
        <div className="grid grid-cols-3 gap-4">
          {labDutyStatus.map(({ labId, sa, todaySlots, isOnDuty }) => (
            <div key={labId} className={`p-5 rounded-2xl border transition-all ${
              isOnDuty ? 'bg-emerald-50/60 border-emerald-200 shadow-emerald-100/50 shadow-md' :
              sa ? 'bg-amber-50/40 border-amber-200' :
              'bg-white border-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-900">Laboratory {labId}</span>
                {isOnDuty ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-300" />
                )}
              </div>
              <div className="mb-2">
                {sa ? (
                  <>
                    <p className={`text-sm font-bold ${isOnDuty ? 'text-emerald-700' : 'text-amber-700'}`}>{sa.saName}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isOnDuty ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {isOnDuty ? '● On Duty' : '○ Off Hours'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 font-medium">No SA assigned</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">— Unassigned</p>
                  </>
                )}
              </div>
              {todaySlots.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100/50">
                  <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {todaySlots.map((s) => `${s.startTime}–${s.endTime}`).join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Lab Reports */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <button onClick={() => setShowReports(!showReports)} className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="text-sm font-bold text-gray-900">Teacher Lab Reports — SA on Duty</h2>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{teacherLabReports.length}</span>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showReports ? 'rotate-180' : ''}`} />
        </button>
        {showReports && (
          <div className="p-6 pt-0">
            {teacherLabReports.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No teacher lab reports yet.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-3">Teacher</th><th className="pb-3">Lab</th><th className="pb-3">Report</th><th className="pb-3">SA on Duty</th><th className="pb-3">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-gray-700 divide-y divide-gray-50">
                  {teacherLabReports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-bold">{r.teacherName}</td>
                      <td className="py-3 text-gray-500">{r.labName}</td>
                      <td className="py-3">{r.title}</td>
                      <td className="py-3">
                        {r.saName ? (
                          <span className="text-emerald-600 font-bold">{r.saName}</span>
                        ) : (
                          <span className="text-gray-400 italic">No SA</span>
                        )}
                      </td>
                      <td className="py-3 text-gray-400 text-[11px]">{new Date(r.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
