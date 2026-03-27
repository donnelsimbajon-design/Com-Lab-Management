"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { DoorOpen, Clock, CalendarDays, LogIn, LogOut, Timer, AlertTriangle, CheckCircle2, IdCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OPEN_LAB_ID = 3;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatDuration(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function isOpenNow(slots: { day: string; startTime: string; endTime: string }[]): { open: boolean; current?: { startTime: string; endTime: string } } {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const match = slots.find((s) => s.day === dayName && hhmm >= s.startTime && hhmm <= s.endTime);
  return match ? { open: true, current: match } : { open: false };
}

export default function OpenLab() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const openLabSlots = useAppStore((s) => s.openLabSlots);
  const labVisits = useAppStore((s) => s.labVisits);
  const enterLab = useAppStore((s) => s.enterLab);
  const leaveLab = useAppStore((s) => s.leaveLab);

  const userId = currentUser?.id || '';
  const userName = currentUser?.name || 'Student';
  const userRole = currentUser?.role || 'student';

  const slots = openLabSlots.filter((s) => s.labId === OPEN_LAB_ID);
  const { open: isOpen, current: currentSlot } = isOpenNow(slots);

  // Active visit for this user
  const activeVisit = labVisits.find((v) => v.userId === userId && v.labId === OPEN_LAB_ID && !v.leftAt);

  // Live timer
  const [elapsed, setElapsed] = useState(0);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (!activeVisit) { setElapsed(0); return; }
    const interval = setInterval(() => {
      setElapsed(Date.now() - new Date(activeVisit.enteredAt).getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeVisit]);

  // My past visits
  const myVisits = labVisits.filter((v) => v.userId === userId && v.labId === OPEN_LAB_ID && v.leftAt);

  const handleEnterClick = () => {
    if (!isOpen) { toast.error('Laboratory 3 is not open right now.'); return; }
    setShowReminder(true);
  };

  const confirmEnter = () => {
    enterLab(userId, userName, userRole, OPEN_LAB_ID);
    toast.success('You have entered Laboratory 3. Your time is being tracked.');
    setShowReminder(false);
  };

  const handleLeave = () => {
    if (!activeVisit) return;
    leaveLab(activeVisit.id);
    toast.success('You have left Laboratory 3. Your time has been recorded.');
  };

  // Availability duration countdown
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySlots = slots.filter((s) => s.day === todayName);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Open Laboratory</h1>
        <p className="text-sm text-gray-500 mt-1">Laboratory 3 is designated for open access. Check availability and enter when it&apos;s open.</p>
      </div>

      {/* Status Card */}
      <div className={`rounded-2xl border p-8 shadow-sm transition-all ${
        isOpen ? 'bg-gradient-to-br from-emerald-50 to-green-50/50 border-emerald-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${isOpen ? 'bg-emerald-100' : 'bg-gray-200'}`}>
              <DoorOpen className={`h-8 w-8 ${isOpen ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Laboratory 3</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className={`text-sm font-bold ${isOpen ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {isOpen ? 'OPEN NOW' : 'CLOSED'}
                </span>
              </div>
            </div>
          </div>
          {isOpen && currentSlot && (
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Session</p>
              <p className="text-lg font-bold text-emerald-700">{currentSlot.startTime} — {currentSlot.endTime}</p>
            </div>
          )}
        </div>

        {/* Enter / Active / Leave */}
        {activeVisit ? (
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <Timer className="h-6 w-6 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Inside Lab</p>
                  <p className="text-3xl font-black text-gray-900 font-mono tracking-tight">{formatDuration(elapsed)}</p>
                </div>
              </div>
              <Button onClick={handleLeave} className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-3 font-bold shadow-md flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Leave Laboratory
              </Button>
            </div>
          </div>
        ) : isOpen ? (
          <Button onClick={handleEnterClick} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-200 flex items-center justify-center gap-3">
            <LogIn className="h-5 w-5" /> Enter Laboratory 3
          </Button>
        ) : (
          <div className="bg-white/60 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 font-medium">Laboratory 3 is currently closed. Check the schedule below for open hours.</p>
          </div>
        )}
      </div>

      {/* ID Reminder Modal */}
      {showReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-3 rounded-xl">
                <IdCard className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reminder</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Please bring your <strong>School ID</strong> and present it to the <strong>Student Assistant</strong> for verification before entering Laboratory 3.
            </p>
            <div className="flex gap-3">
              <Button onClick={confirmEnter} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-12">
                <CheckCircle2 className="h-4 w-4 mr-2" /> I Have My ID — Enter
              </Button>
              <Button variant="outline" onClick={() => setShowReminder(false)} className="rounded-xl font-bold h-12 px-6">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Weekly Schedule</h3>
          </div>
          {slots.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No schedule set yet. The SA will update availability.</p>
          ) : (
            <div className="space-y-2">
              {DAYS.map((day) => {
                const daySlots = slots.filter((s) => s.day === day);
                if (daySlots.length === 0) return null;
                const isToday = day === todayName;
                return (
                  <div key={day} className={`flex items-center justify-between p-3 rounded-xl ${isToday ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                    <span className={`text-xs font-bold ${isToday ? 'text-blue-700' : 'text-gray-600'} w-24`}>
                      {day} {isToday && '(Today)'}
                    </span>
                    <div className="flex gap-2">
                      {daySlots.map((ds, i) => (
                        <span key={i} className="text-xs font-medium text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" /> {ds.startTime} — {ds.endTime}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Visit History */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900">My Visit History</h3>
          </div>
          {myVisits.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No visits recorded yet.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {myVisits.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-700">{new Date(v.enteredAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-500">{new Date(v.enteredAt).toLocaleTimeString()} — {v.leftAt ? new Date(v.leftAt).toLocaleTimeString() : '—'}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    {v.duration != null ? `${v.duration} min` : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
