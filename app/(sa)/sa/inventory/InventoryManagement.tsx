"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { hasPermission } from '@/lib/security/rbac';
import { sanitizeInput, containsScriptInjection } from '@/lib/security/sanitize';
import { toast } from 'sonner';
import { Package, Search, Plus, X, Wrench, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function InventoryManagement() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const equipment = useAppStore((s) => s.equipment);
  const updateEquipment = useAppStore((s) => s.updateEquipment);
  const role = currentUser?.role;
  const canUpdate = hasPermission(role, 'equipment:update');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const filtered = equipment.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleToggleMaintenance = (id: string, name: string, current: string) => {
    if (!canUpdate) { toast.error('Unauthorized.'); return; }
    const next = current === 'maintenance' ? 'available' : 'maintenance';
    updateEquipment(id, { status: next as any, assignedTo: null });
    logAudit('EQUIPMENT_UPDATED', currentUser?.id || '', currentUser?.name || '', role || '', `${name} → ${next}`);
    toast.success(`${name} marked as ${next}`);
  };

  const STATUS_COLORS: Record<string, string> = { available: 'bg-emerald-50 text-emerald-600 border-emerald-100', 'in-use': 'bg-blue-50 text-blue-600 border-blue-100', maintenance: 'bg-red-50 text-red-600 border-red-100' };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div><h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1><p className="text-sm text-gray-500 mt-1">Monitor and manage lab equipment status.</p></div>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" /></div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-11 px-4 pr-8 rounded-xl border border-gray-200 text-sm font-medium bg-white"><option value="all">All</option><option value="available">Available</option><option value="in-use">In Use</option><option value="maintenance">Maintenance</option></select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p><p className="text-2xl font-bold text-gray-900 mt-1">{equipment.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</p><p className="text-2xl font-bold text-emerald-600 mt-1">{equipment.filter((e) => e.status === 'available').length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Maintenance</p><p className="text-2xl font-bold text-red-600 mt-1">{equipment.filter((e) => e.status === 'maintenance').length}</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="text-[10px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-100"><th className="p-4">Equipment</th><th className="p-4">Category</th><th className="p-4">Lab</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
          <tbody className="text-sm text-gray-900 divide-y divide-gray-50">
            {filtered.map((eq) => (
              <tr key={eq.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-bold">{eq.name}</td>
                <td className="p-4 text-gray-500">{eq.category}</td>
                <td className="p-4 text-gray-500">{eq.lab}</td>
                <td className="p-4"><span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${STATUS_COLORS[eq.status]}`}>{eq.status}</span></td>
                <td className="p-4 text-right">
                  {canUpdate ? (
                    <button onClick={() => handleToggleMaintenance(eq.id, eq.name, eq.status)} className="text-gray-400 hover:text-amber-500 transition-colors" title="Toggle maintenance">
                      <Wrench className="h-4 w-4" />
                    </button>
                  ) : <Lock className="h-4 w-4 text-gray-300 inline" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
