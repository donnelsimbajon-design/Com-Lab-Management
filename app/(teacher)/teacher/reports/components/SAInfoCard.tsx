"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { User, ShieldAlert, CheckCircle2, UserX, Clock } from 'lucide-react';

export function SAInfoCard({ labId }: { labId: number | null }) {
  const saAssignments = useAppStore((s) => s.saAssignments);
  const openLabSlots = useAppStore((s) => s.openLabSlots);

  if (!labId) return null;

  // Find SA assigned to this lab
  const assignment = saAssignments.find((a) => a.isActive && a.labIds.includes(labId));

  // Check if SA is currently on duty based on time
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Check open lab slots for this lab to determine if SA should be on duty
  const todaySlots = openLabSlots.filter(
    (s) => s.labId === labId && s.day === dayName
  );
  const isWithinSchedule = todaySlots.some(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime
  );

  // SA is "on duty" if assigned AND within a scheduled time slot (or always if no slots configured)
  const isOnDuty = assignment && (todaySlots.length === 0 || isWithinSchedule);

  let statusText = "No SA Available";
  let statusColor = "text-red-700 bg-red-50 border-red-200";
  let StatusIcon = UserX;

  if (assignment && isOnDuty) {
    statusText = "SA On Duty";
    statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    StatusIcon = CheckCircle2;
  } else if (assignment && !isOnDuty) {
    statusText = "SA Assigned (Off Hours)";
    statusColor = "text-amber-700 bg-amber-50 border-amber-200";
    StatusIcon = ShieldAlert;
  }

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 transition-all duration-300 ${statusColor.split(' ')[2]}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" /> Current SA Duty Status
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${statusColor}`}>
          <StatusIcon className="h-3 w-3" />
          {statusText}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned SA</p>
          <p className="text-sm font-medium text-gray-800">{assignment ? assignment.saName : "Unassigned"}</p>
          {assignment && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              Labs {assignment.labIds.join(' & ')} · Since {new Date(assignment.assignedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Currently On-Duty</p>
          <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
            {isOnDuty ? assignment!.saName : "None"}
            {isOnDuty && <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>}
          </p>
          {todaySlots.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <p className="text-[10px] text-gray-400">
                Today: {todaySlots.map((s) => `${s.startTime}–${s.endTime}`).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Time Check</p>
        <p className="text-xs text-gray-600 font-medium">
          {dayName}, {now.toLocaleTimeString()} · Lab {labId}
        </p>
      </div>
    </div>
  );
}
