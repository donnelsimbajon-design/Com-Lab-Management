"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { sanitizeInput, containsScriptInjection } from '@/lib/security/sanitize';
import { toast } from 'sonner';
import { FileWarning, Send, Plus, Clock, MapPin, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LabSelection } from './components/LabSelection';
import { SAInfoCard } from './components/SAInfoCard';

export default function LabReports() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const tickets = useAppStore((s) => s.tickets);
  const createTicket = useAppStore((s) => s.createTicket);
  const createReport = useAppStore((s) => s.createReport);
  const userId = currentUser?.id || '';
  const myTickets = tickets.filter((t) => t.userId === userId);

  const [showForm, setShowForm] = useState(false);
  
  // New State for Dynamic Flow
  const [selectedLabId, setSelectedLabId] = useState<number | null>(null);
  const [selectedLabName, setSelectedLabName] = useState('');
  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const submitTeacherLabReport = useAppStore((s) => s.submitTeacherLabReport);

  const handleSubmit = async () => {
    if (containsScriptInjection(title) || containsScriptInjection(desc)) { toast.error('Invalid input.'); return; }
    const safe = { title: sanitizeInput(title), desc: sanitizeInput(desc), lab: sanitizeInput(selectedLabName) };
    if (!safe.title || safe.title.length < 3) { toast.error('Title min 3 chars.'); return; }
    if (!selectedLabId || !safe.lab) { toast.error('Lab selection is required.'); return; }
    
    // Existing ticket + report
    createTicket({ 
      userId, 
      type: 'incident', 
      title: safe.title, 
      description: safe.desc || 'No details.', 
      status: 'open', 
      priority, 
      lab: `Lab ${selectedLabId} - ${safe.lab}` 
    });
    
    createReport({ teacherId: userId, title: safe.title, description: safe.desc });

    // New: persist teacher lab report with SA on duty tracking
    await submitTeacherLabReport({
      teacherId: userId,
      teacherName: currentUser?.name || 'Unknown Teacher',
      labId: selectedLabId,
      labName: `Laboratory ${selectedLabId}`,
      title: safe.title,
      description: safe.desc || 'No details.',
    });

    logAudit('REPORT_SUBMITTED', userId, currentUser?.name || '', currentUser?.role || '', `Report: ${safe.title}`);
    
    toast.success('Report submitted successfully!');
    setTitle(''); setDesc(''); setSelectedLabId(null); setSelectedLabName(''); setShowForm(false);
  };

  const handleCancelNewReport = () => {
    setShowForm(false);
    setSelectedLabId(null);
    setSelectedLabName('');
    setTitle('');
    setDesc('');
  };

  const STATUS_COLORS: Record<string, string> = { open: 'text-amber-600 bg-amber-50', 'in-progress': 'text-blue-600 bg-blue-50', resolved: 'text-emerald-600 bg-emerald-50' };
  const PRIORITY_COLORS: Record<string, string> = { high: 'text-red-600 bg-red-50', medium: 'text-gray-600 bg-gray-100', low: 'text-gray-500 bg-gray-50' };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incident Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Report issues dynamically tied to laboratory shifts.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-xl px-5 font-bold shadow-md">
            <Plus className="h-4 w-4 mr-2" /> New Report
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border shadow-sm rounded-2xl p-6 space-y-6 animate-in slide-in-from-top duration-300 relative">
          <div className="absolute top-4 right-4">
             <Button variant="ghost" size="sm" onClick={handleCancelNewReport} className="text-gray-500 rounded-xl hover:bg-gray-100">Cancel</Button>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-800">Submit a Report</h2>
            <p className="text-sm text-gray-500">Select the facility to automatically log the on-duty SA details.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <LabSelection 
                selectedLabId={selectedLabId === null ? undefined : selectedLabId} 
                onSelect={(id, name) => {
                  setSelectedLabId(id);
                  setSelectedLabName(name);
                }} 
              />
              {selectedLabId && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <SAInfoCard labId={selectedLabId} />
                </div>
              )}
            </div>

            <div className={`space-y-4 transition-all duration-300 ${!selectedLabId ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Incident Details</label>
                 <Input placeholder="Enter brief incident title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                 <Input placeholder="Detailed description of the problem or report" value={desc} onChange={(e) => setDesc(e.target.value)} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')} className="h-11 w-full px-4 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="high">High - Immediate Action Needed</option>
                  <option value="medium">Medium - Normal Incident</option>
                  <option value="low">Low - Minor Issue</option>
                </select>
              </div>

              <div className="pt-2">
                <Button onClick={handleSubmit} className="w-full h-11 bg-[#164ac9] text-white rounded-xl font-bold shadow-md hover:bg-blue-800 transition-all">
                  <Send className="h-4 w-4 mr-2" /> Submit Report Linked to {selectedLabName || 'Lab'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p><p className="text-2xl font-bold text-gray-900 mt-1">{myTickets.length}</p></div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Open</p><p className="text-2xl font-bold text-amber-600 mt-1">{myTickets.filter((t) => t.status === 'open').length}</p></div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolved</p><p className="text-2xl font-bold text-emerald-600 mt-1">{myTickets.filter((t) => t.status === 'resolved').length}</p></div>
          </div>
          <div className="space-y-4">
            {myTickets.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm"><FileWarning className="h-8 w-8 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-400">No reports yet.</p></div>
            ) : myTickets.map((t) => (
              <div key={t.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                </div>
                <h3 className="font-bold text-sm text-gray-900">{t.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500"><MapPin className="h-3 w-3" /> {t.lab}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500"><Clock className="h-3 w-3" /> {t.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
