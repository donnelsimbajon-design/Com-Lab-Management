"use client";

import React, { useEffect, useState } from 'react';
import { User, ShieldAlert, CheckCircle2, UserX } from 'lucide-react';

interface SAInfo {
  id: string;
  name: string;
}

export function SAInfoCard({ labId }: { labId: number | null }) {
  const [assignedSA, setAssignedSA] = useState<SAInfo | null>(null);
  const [onDutySA, setOnDutySA] = useState<SAInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!labId) {
      setAssignedSA(null);
      setOnDutySA(null);
      return;
    }

    let isMounted = true;
    
    async function fetchData() {
      setLoading(true);
      try {
        const [assignedRes, onDutyRes] = await Promise.all([
          fetch(`/api/labs/${labId}/assigned-sa`),
          fetch(`/api/sa/on-duty?labId=${labId}`)
        ]);
        
        const assignedData = await assignedRes.json();
        const onDutyData = await onDutyRes.json();
        
        if (isMounted) {
          setAssignedSA(assignedData.sa || null);
          setOnDutySA(onDutyData.sa || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchData();
    
    // Auto-refresh every minute
    const interval = setInterval(fetchData, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [labId]);

  if (!labId) return null;

  if (loading) return (
    <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 bg-gray-100 rounded"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
      </div>
    </div>
  );

  let statusText = "No SA Available";
  let statusColor = "text-red-700 bg-red-50 border-red-200";
  let StatusIcon = UserX;

  if (assignedSA && onDutySA && assignedSA.id === onDutySA.id) {
    statusText = "Normal Operation";
    statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    StatusIcon = CheckCircle2;
  } else if (onDutySA) {
    statusText = "Reliever Assigned";
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
          <p className="text-sm font-medium text-gray-800">{assignedSA ? assignedSA.name : "Unassigned"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Currently On-Duty</p>
          <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
            {onDutySA ? onDutySA.name : "None"}
            {onDutySA && <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>}
          </p>
        </div>
      </div>
    </div>
  );
}
