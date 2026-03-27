"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { sanitizeInput, containsScriptInjection } from '@/lib/security/sanitize';
import { toast } from 'sonner';
import { Search, MapPin, AlertTriangle, Send, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LABORATORIES = Array.from({ length: 9 }, (_, i) => `Laboratory ${i + 1}`);

export default function LostFound() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const createTicket = useAppStore((s) => s.createTicket);

  const userId = currentUser?.id || '';
  const lostItems = tickets.filter((t) => t.type === 'lost-item');
  const myReports = lostItems.filter((t) => t.userId === userId);
  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'Anonymous';

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [lab, setLab] = useState('');

  const handleSubmit = () => {
    if (containsScriptInjection(title) || containsScriptInjection(desc)) { toast.error('Invalid input.'); return; }
    const safeTitle = sanitizeInput(title); const safeDesc = sanitizeInput(desc);
    if (!safeTitle || safeTitle.length < 3) { toast.error('Title must be at least 3 characters.'); return; }
    if (!lab) { toast.error('Select the laboratory location.'); return; }
    createTicket({ userId, type: 'lost-item', title: safeTitle, description: safeDesc || 'No details.', status: 'open', priority: 'medium', lab });
    logAudit('TICKET_CREATED', userId, currentUser?.name || '', currentUser?.role || '', `Lost item: ${safeTitle}`);
    toast.success('Lost item reported!');
    setTitle(''); setDesc(''); setLab(''); setShowForm(false);
  };

  const STATUS_STYLE: Record<string, string> = { open: 'text-amber-600 bg-amber-50', 'in-progress': 'text-blue-600 bg-blue-50', resolved: 'text-emerald-600 bg-emerald-50' };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Lost & Found</h1><p className="text-sm text-gray-500 mt-1">Report lost items or check if yours has been found.</p></div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-xl px-5 font-bold shadow-md"><AlertTriangle className="h-4 w-4 mr-2" /> Report</Button>
      </div>
      {showForm && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top duration-300">
          <h3 className="font-bold text-sm text-gray-900">Report a Lost Item</h3>
          <Input placeholder="What did you lose?" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
          <Input placeholder="Description (color, brand)" value={desc} onChange={(e) => setDesc(e.target.value)} className="rounded-xl" />
          
          {/* Lab location dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Last Seen Location</label>
            <select
              value={lab}
              onChange={(e) => setLab(e.target.value)}
              className="h-11 w-full px-4 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Laboratory...</option>
              {LABORATORIES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} className="bg-[#164ac9] text-white rounded-xl font-bold"><Send className="h-4 w-4 mr-2" /> Submit</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Reports</p><p className="text-2xl font-bold text-gray-900 mt-1">{lostItems.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">My Reports</p><p className="text-2xl font-bold text-blue-600 mt-1">{myReports.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolved</p><p className="text-2xl font-bold text-emerald-600 mt-1">{lostItems.filter((t) => t.status === 'resolved').length}</p></div>
      </div>
      <div className="space-y-4">
        {lostItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100"><Search className="h-8 w-8 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-400 font-medium">No reports yet.</p></div>
        ) : lostItems.map((t) => (
          <div key={t.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900">{t.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500"><MapPin className="h-3 w-3" /> {t.lab}</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500"><Clock className="h-3 w-3" /> {t.createdAt}</span>
                  <span className="text-[10px] font-bold text-gray-400">by {getUserName(t.userId)}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${STATUS_STYLE[t.status]}`}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
