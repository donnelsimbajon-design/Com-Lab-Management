"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export interface Lab {
  id: number;
  name: string;
}

const FALLBACK_LABS: Lab[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  name: `Laboratory ${i + 1}`,
}));

export function LabSelection({ onSelect, selectedLabId }: { onSelect: (id: number, name: string) => void, selectedLabId?: number }) {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/labs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLabs(data);
        } else {
          setLabs(FALLBACK_LABS);
        }
        setLoading(false);
      })
      .catch(() => {
        setLabs(FALLBACK_LABS);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-sm text-gray-500 animate-pulse bg-gray-50 p-4 rounded-xl border border-gray-100">Loading laboratories...</div>;

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Select Laboratory</label>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {labs.map((lab) => (
          <Button
            key={lab.id}
            variant={selectedLabId === lab.id ? "default" : "outline"}
            onClick={() => onSelect(lab.id, lab.name)}
            className={`h-auto py-3 px-4 rounded-xl flex flex-col items-start ${selectedLabId === lab.id ? 'bg-[#164ac9] text-white hover:bg-blue-800' : 'bg-white text-gray-700 hover:border-[#164ac9] border border-gray-200 shadow-sm'}`}
          >
            <span className="font-bold">{lab.name}</span>
            <span className={`text-[10px] ${selectedLabId === lab.id ? 'text-blue-200' : 'text-gray-400'}`}>Lab ID: {lab.id}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
