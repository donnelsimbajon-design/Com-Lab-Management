"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function ClassSchedules() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const schedules = useAppStore((s) => s.schedules);
  const labs = useAppStore((s) => s.labs);
  const userId = currentUser?.id || '';
  const mySchedules = schedules.filter((s) => s.teacherId === userId);

  const STATUS_COLORS: Record<string, string> = { ongoing: 'bg-blue-50 text-[#164ac9] border-blue-100', upcoming: 'bg-gray-50 text-gray-500 border-gray-200', completed: 'bg-emerald-50 text-emerald-600 border-emerald-100' };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div><h1 className="text-2xl font-bold text-gray-900">Class Schedules</h1><p className="text-sm text-gray-500 mt-1">Your assigned classes and lab sessions.</p></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Classes</p><p className="text-2xl font-bold text-gray-900 mt-1">{mySchedules.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Labs Used</p><p className="text-2xl font-bold text-blue-600 mt-1">{new Set(mySchedules.map((s) => s.lab)).size}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today</p><p className="text-lg font-bold text-gray-900 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p></div>
      </div>
      <div className="space-y-4">
        {mySchedules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100"><Calendar className="h-8 w-8 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-400">No classes scheduled.</p></div>
        ) : mySchedules.map((s) => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
            <div className={`absolute left-0 top-0 bottom-0 w-[5px] ${s.status === 'ongoing' ? 'bg-[#164ac9]' : 'bg-gray-200'}`} />
            <div className="flex items-center justify-between pl-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{s.subject}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Clock className="h-3.5 w-3.5" /> {s.time}</span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><MapPin className="h-3.5 w-3.5" /> {s.lab}</span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Calendar className="h-3.5 w-3.5" /> {s.day}</span>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border capitalize ${STATUS_COLORS[s.status]}`}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-sm font-bold text-gray-900 tracking-wide mb-4">Lab Availability (Live)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {labs.map((l) => {
            const pct = Math.round((l.occupiedUnits / l.totalUnits) * 100);
            return (
              <div key={l.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                <div><p className="font-bold text-sm text-gray-900">{l.name}</p><p className="text-[10px] text-gray-500">{l.location}</p></div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{l.totalUnits - l.occupiedUnits} free</p>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
