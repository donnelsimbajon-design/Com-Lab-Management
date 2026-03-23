"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { sanitizeInput, containsScriptInjection } from '@/lib/security/sanitize';
import { toast } from 'sonner';
import { Laptop, Plus, Send, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SoftwareRequests() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const softwareRequests = useAppStore((s) => s.softwareRequests);
  const createSoftwareRequest = useAppStore((s) => s.createSoftwareRequest);
  const userId = currentUser?.id || '';
  const myRequests = softwareRequests.filter((r) => r.teacherId === userId);

  const [showForm, setShowForm] = useState(false);
  const [swName, setSwName] = useState('');
  const [swLab, setSwLab] = useState('');

  const handleSubmit = () => {
    if (containsScriptInjection(swName)) { toast.error('Invalid input.'); return; }
    const name = sanitizeInput(swName); const lab = sanitizeInput(swLab);
    if (!name || !lab) { toast.error('Fill all fields.'); return; }
    createSoftwareRequest({ teacherId: userId, softwareName: name, lab, status: 'pending' });
    logAudit('SOFTWARE_REQUESTED', userId, currentUser?.name || '', currentUser?.role || '', `${name} for ${lab}`);
    toast.success('Request submitted!');
    setSwName(''); setSwLab(''); setShowForm(false);
  };

  const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    pending: { icon: <Loader2 className="h-4 w-4 animate-spin text-amber-500" />, label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    approved: { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, label: 'Approved', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    installed: { icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />, label: 'Installed', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    denied: { icon: <Clock className="h-4 w-4 text-red-500" />, label: 'Denied', color: 'text-red-600 bg-red-50 border-red-100' },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Software Requests</h1><p className="text-sm text-gray-500 mt-1">Request software installations for lab sessions.</p></div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-xl px-5 font-bold shadow-md"><Plus className="h-4 w-4 mr-2" /> New Request</Button>
      </div>
      {showForm && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top duration-300">
          <Input placeholder="Software name" value={swName} onChange={(e) => setSwName(e.target.value)} className="rounded-xl" />
          <Input placeholder="Target lab" value={swLab} onChange={(e) => setSwLab(e.target.value)} className="rounded-xl" />
          <div className="flex gap-3"><Button onClick={handleSubmit} className="bg-[#164ac9] text-white rounded-xl font-bold"><Send className="h-4 w-4 mr-2" /> Submit</Button><Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button></div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p><p className="text-2xl font-bold text-gray-900 mt-1">{myRequests.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p><p className="text-2xl font-bold text-amber-600 mt-1">{myRequests.filter((r) => r.status === 'pending').length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Approved</p><p className="text-2xl font-bold text-emerald-600 mt-1">{myRequests.filter((r) => r.status === 'approved' || r.status === 'installed').length}</p></div>
      </div>
      <div className="space-y-3">
        {myRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100"><Laptop className="h-8 w-8 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-400">No requests yet.</p></div>
        ) : myRequests.map((r) => {
          const cfg = STATUS_CONFIG[r.status];
          return (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl"><Laptop className="h-5 w-5 text-[#164ac9]" /></div>
                <div><h3 className="font-bold text-sm text-gray-900">{r.softwareName}</h3><p className="text-[10px] text-gray-500 font-semibold mt-0.5">For {r.lab} · {r.createdAt}</p></div>
              </div>
              <div className="flex items-center gap-2">{cfg.icon}<span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${cfg.color}`}>{cfg.label}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
