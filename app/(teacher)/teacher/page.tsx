"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import {
  GraduationCap, Settings2, BarChart3, Bug, CheckCircle2, Shield,
  ClipboardList, Bell, Plus, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TeacherDashboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const tickets = useAppStore((s) => s.tickets);
  const softwareRequests = useAppStore((s) => s.softwareRequests);
  const bookings = useAppStore((s) => s.bookings);
  const labs = useAppStore((s) => s.labs);
  const createTicket = useAppStore((s) => s.createTicket);
  const createSoftwareRequest = useAppStore((s) => s.createSoftwareRequest);
  const createReport = useAppStore((s) => s.createReport);

  const userId = currentUser?.id || 'u3';
  const userName = currentUser?.name || 'Teacher';

  // Derived
  const myRequests = softwareRequests.filter((r) => r.teacherId === userId);
  const myTickets = tickets.filter((t) => t.userId === userId);
  const activeClasses = 4; // Mock schedule count
  const avgUtilization = labs.length
    ? Math.round(labs.reduce((acc, l) => acc + (l.occupiedUnits / l.totalUnits) * 100, 0) / labs.length)
    : 0;

  // Forms
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');

  const [showSoftwareForm, setShowSoftwareForm] = useState(false);
  const [swName, setSwName] = useState('');
  const [swLab, setSwLab] = useState('');

  const handleNewReport = () => {
    if (!reportTitle) { toast.error('Please enter a title.'); return; }
    createTicket({
      userId,
      type: 'incident',
      title: reportTitle,
      description: reportDesc || 'No description provided.',
      status: 'open',
      priority: 'medium',
      lab: 'Lab 1',
    });
    createReport({ teacherId: userId, title: reportTitle, description: reportDesc });
    toast.success('Incident report submitted! SA has been notified.');
    setReportTitle('');
    setReportDesc('');
    setShowReportForm(false);
  };

  const handleNewSoftwareRequest = () => {
    if (!swName || !swLab) { toast.error('Please fill in all fields.'); return; }
    createSoftwareRequest({ teacherId: userId, softwareName: swName, lab: swLab, status: 'pending' });
    toast.success('Software request submitted!');
    setSwName('');
    setSwLab('');
    setShowSoftwareForm(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Teacher Dashboard</h1>
          <p className="text-sm text-gray-400 mt-2 font-medium tracking-wide">Welcome back, {userName}! Here is what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl border-gray-200 text-gray-500 h-10 w-10">
            <Bell className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowReportForm(!showReportForm)} className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-xl px-5 font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 h-10">
            <Plus className="h-4 w-4" /> New Report
          </Button>
        </div>
      </div>

      {/* Report Form */}
      {showReportForm && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top duration-300">
          <h3 className="font-bold text-sm text-gray-900">Submit Incident Report</h3>
          <Input placeholder="Title (e.g. Broken monitor in Lab 3)" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} className="rounded-xl" />
          <Input placeholder="Description (optional)" value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} className="rounded-xl" />
          <div className="flex gap-3">
            <Button onClick={handleNewReport} className="bg-[#164ac9] text-white rounded-xl font-bold"><Send className="h-4 w-4 mr-2" /> Submit</Button>
            <Button variant="outline" onClick={() => setShowReportForm(false)} className="rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#f8fafc] border border-gray-100 p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Active Classes</h3>
            <GraduationCap className="h-4 w-4 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{String(activeClasses).padStart(2, '0')}</p>
          <p className="text-[10px] font-bold text-[#16a34a] mt-2">2 labs currently in use</p>
        </div>
        <div className="bg-[#f8fafc] border border-gray-100 p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Software Reqs</h3>
            <Settings2 className="h-4 w-4 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{String(myRequests.length).padStart(2, '0')}</p>
          <p className="text-[10px] font-bold text-amber-500 mt-2">{myRequests.filter((r) => r.status === 'pending').length} pending</p>
        </div>
        <div className="bg-[#f8fafc] border border-gray-100 p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Lab Utilization</h3>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgUtilization}%</p>
          <p className="text-[10px] font-bold text-[#16a34a] mt-2">Across all labs</p>
        </div>
        <div className="bg-[#f8fafc] border border-gray-100 p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Reported Issues</h3>
            <Bug className="h-4 w-4 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{String(myTickets.length).padStart(2, '0')}</p>
          <p className="text-[10px] font-bold text-red-500 mt-2">{myTickets.filter((t) => t.status === 'open').length} open</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-[#f8fafc] border border-gray-100 rounded-[2rem] p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">Today&apos;s Class Schedule</h2>
              <div className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-500 shadow-sm">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[#164ac9]" />
                <div className="pl-4">
                  <h3 className="font-bold text-gray-900 text-lg">CS101 - Introduction to Computing</h3>
                  <p className="text-[11px] font-semibold text-gray-400 mt-1 uppercase tracking-wide">09:00 AM - 11:30 AM • Lab 302</p>
                </div>
                <div className="px-5 py-2 bg-blue-50/80 text-[#164ac9] border border-blue-100 rounded-xl text-xs font-bold">Ongoing</div>
              </div>
              <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gray-200" />
                <div className="pl-4">
                  <h3 className="font-bold text-gray-900 text-lg">IT204 - Database Systems</h3>
                  <p className="text-[11px] font-semibold text-gray-400 mt-1 uppercase tracking-wide">01:00 PM - 03:30 PM • Lab 101</p>
                </div>
                <div className="px-5 py-2 bg-gray-50 text-gray-400 border border-gray-200 rounded-xl text-xs font-bold">Upcoming</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-8">
          {/* Software Requests */}
          <div className="bg-[#f8fafc] border border-gray-100 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Software Requests</h2>
              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setShowSoftwareForm(!showSoftwareForm)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {showSoftwareForm && (
              <div className="mb-4 p-4 bg-white border border-gray-100 rounded-xl space-y-3">
                <Input placeholder="Software name" value={swName} onChange={(e) => setSwName(e.target.value)} className="rounded-xl text-sm" />
                <Input placeholder="Lab (e.g. Lab 302)" value={swLab} onChange={(e) => setSwLab(e.target.value)} className="rounded-xl text-sm" />
                <Button onClick={handleNewSoftwareRequest} size="sm" className="bg-[#164ac9] rounded-xl text-xs w-full">Submit Request</Button>
              </div>
            )}

            <div className="space-y-4">
              {myRequests.map((r) => (
                <div key={r.id} className="bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm border border-transparent hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-[#164ac9]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{r.softwareName}</h4>
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Requested for {r.lab}</p>
                    </div>
                  </div>
                  {r.status === 'approved' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : r.status === 'pending' ? (
                    <span className="text-[10px] font-bold text-amber-500 uppercase">Pending</span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">{r.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-[#f8fafc] border border-gray-100 rounded-[2rem] p-8 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-[#164ac9] rounded-md p-1"><CheckCircle2 className="h-4 w-4 text-white" /></div>
                <h3 className="font-bold text-sm text-gray-900">Functional Requirements</h3>
              </div>
              <ul className="space-y-3.5 px-1">
                <li className="flex items-center gap-3 text-xs font-semibold text-gray-500"><CheckCircle2 className="h-4 w-4 text-[#164ac9]" /> View real-time class schedules</li>
                <li className="flex items-center gap-3 text-xs font-semibold text-gray-500"><CheckCircle2 className="h-4 w-4 text-[#164ac9]" /> Monitor lab utilization metrics</li>
                <li className="flex items-center gap-3 text-xs font-semibold text-gray-500"><CheckCircle2 className="h-4 w-4 text-[#164ac9]" /> Track software installation requests</li>
              </ul>
            </div>
            <div className="pt-2">
              <div className="flex items-center gap-3 mb-5">
                <Shield className="h-5 w-5 text-gray-600" />
                <h3 className="font-bold text-sm text-gray-900">Non-Functional Requirements</h3>
              </div>
              <ul className="space-y-3.5 px-1">
                <li className="flex items-center gap-3 text-xs font-semibold text-gray-500"><CheckCircle2 className="h-4 w-4 text-gray-400" /> High data accuracy for schedules</li>
                <li className="flex items-center gap-3 text-xs font-semibold text-gray-500"><CheckCircle2 className="h-4 w-4 text-gray-400" /> Optimized rendering for speed</li>
                <li className="flex items-center gap-3 text-xs font-semibold text-gray-500"><CheckCircle2 className="h-4 w-4 text-gray-400" /> Mobile-friendly dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
