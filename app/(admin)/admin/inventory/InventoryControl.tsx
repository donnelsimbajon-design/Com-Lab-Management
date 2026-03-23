"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { hasPermission } from '@/lib/security/rbac';
import { sanitizeInput, containsScriptInjection } from '@/lib/security/sanitize';
import { toast } from 'sonner';
import { Package, Search, Plus, Trash2, Wrench, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function InventoryControl() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const equipment = useAppStore((s) => s.equipment);
  const addEquipment = useAppStore((s) => s.addEquipment);
  const deleteEquipment = useAppStore((s) => s.deleteEquipment);
  const updateEquipment = useAppStore((s) => s.updateEquipment);
  const role = currentUser?.role;
  const canCreate = hasPermission(role, 'equipment:create');
  const canDelete = hasPermission(role, 'equipment:delete');
  const canUpdate = hasPermission(role, 'equipment:update');

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', lab: '' });
  const filtered = equipment.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!canCreate) return;
    if (containsScriptInjection(form.name)) { toast.error('Invalid input.'); return; }
    const safe = { name: sanitizeInput(form.name), category: sanitizeInput(form.category), lab: sanitizeInput(form.lab) };
    if (!safe.name || !safe.category || !safe.lab) { toast.error('Fill all fields.'); return; }
    addEquipment({ ...safe, status: 'available', assignedTo: null });
    logAudit('EQUIPMENT_ADDED', currentUser?.id || '', currentUser?.name || '', role || '', `Added: ${safe.name}`);
    toast.success(`${safe.name} added!`);
    setForm({ name: '', category: '', lab: '' }); setShowAdd(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!canDelete) return;
    deleteEquipment(id);
    logAudit('EQUIPMENT_DELETED', currentUser?.id || '', currentUser?.name || '', role || '', `Deleted: ${name}`);
    toast.success(`${name} removed.`);
  };

  const handleToggle = (id: string, name: string, status: string) => {
    if (!canUpdate) return;
    const next = status === 'maintenance' ? 'available' : 'maintenance';
    updateEquipment(id, { status: next as any, assignedTo: null });
    logAudit('EQUIPMENT_UPDATED', currentUser?.id || '', currentUser?.name || '', role || '', `${name} → ${next}`);
    toast.success(`${name} → ${next}`);
  };

  const STATUS_COLORS: Record<string, string> = { available: 'bg-emerald-50 text-emerald-600 border-emerald-100', 'in-use': 'bg-blue-50 text-blue-600 border-blue-100', maintenance: 'bg-red-50 text-red-600 border-red-100' };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Inventory Control</h1><p className="text-sm text-gray-500 mt-1">Full CRUD on equipment. Changes cascade system-wide.</p></div>
        {canCreate ? <Button onClick={() => setShowAdd(!showAdd)} className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-xl px-5 font-bold shadow-md">{showAdd ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}{showAdd ? 'Cancel' : 'Add'}</Button> : <Button disabled className="opacity-50 rounded-xl"><Lock className="h-4 w-4 mr-2" /> No Permission</Button>}
      </div>
      {showAdd && canCreate && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top duration-300">
          <Input placeholder="Equipment name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl" />
            <Input placeholder="Lab" value={form.lab} onChange={(e) => setForm({ ...form, lab: e.target.value })} className="rounded-xl" />
          </div>
          <Button onClick={handleAdd} className="bg-[#164ac9] text-white rounded-xl font-bold w-full">Add Equipment</Button>
        </div>
      )}
      <div className="flex gap-4"><div className="relative flex-1"><Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" /></div></div>
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
                <td className="p-4 font-bold">{eq.name}</td><td className="p-4 text-gray-500">{eq.category}</td><td className="p-4 text-gray-500">{eq.lab}</td>
                <td className="p-4"><span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${STATUS_COLORS[eq.status]}`}>{eq.status}</span></td>
                <td className="p-4 text-right flex gap-2 justify-end">
                  {canUpdate && <button onClick={() => handleToggle(eq.id, eq.name, eq.status)} className="text-gray-400 hover:text-amber-500"><Wrench className="h-4 w-4" /></button>}
                  {canDelete && <button onClick={() => handleDelete(eq.id, eq.name)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
                  {!canUpdate && !canDelete && <Lock className="h-4 w-4 text-gray-300" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
