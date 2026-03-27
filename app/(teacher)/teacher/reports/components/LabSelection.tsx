"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX } from 'lucide-react';

export interface Lab {
  id: number;
  name: string;
}

export function LabSelection({ onSelect, selectedLabId }: { onSelect: (id: number, name: string) => void, selectedLabId?: number }) {
  const storeLabs = useAppStore((s) => s.labs);
  const saAssignments = useAppStore((s) => s.saAssignments);

  // Use store labs if available, otherwise fallback to 1-9
  const labs: Lab[] = storeLabs.length > 0
    ? storeLabs.map((l) => ({ id: Number(l.id), name: l.name }))
    : Array.from({ length: 9 }, (_, i) => ({ id: i + 1, name: `Laboratory ${i + 1}` }));

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Select Laboratory</label>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {labs.map((lab) => {
          const sa = saAssignments.find((a) => a.isActive && a.labIds.includes(lab.id));
          return (
            <Button
              key={lab.id}
              variant={selectedLabId === lab.id ? "default" : "outline"}
              onClick={() => onSelect(lab.id, lab.name)}
              className={`h-auto py-3 px-4 rounded-xl flex flex-col items-start ${selectedLabId === lab.id ? 'bg-[#164ac9] text-white hover:bg-blue-800' : 'bg-white text-gray-700 hover:border-[#164ac9] border border-gray-200 shadow-sm'}`}
            >
              <span className="font-bold">{lab.name}</span>
              <span className={`text-[10px] flex items-center gap-1 mt-0.5 ${selectedLabId === lab.id ? 'text-blue-200' : sa ? 'text-emerald-500' : 'text-gray-400'}`}>
                {sa ? (
                  <><UserCheck className="h-3 w-3" /> {sa.saName}</>
                ) : (
                  <><UserX className="h-3 w-3" /> No SA</>
                )}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
