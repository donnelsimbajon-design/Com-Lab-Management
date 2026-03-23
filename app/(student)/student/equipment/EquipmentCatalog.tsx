"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { hasPermission } from '@/lib/security/rbac';
import { toast } from 'sonner';
import { Monitor, Search, Package, Cpu, Printer, Lock, Plus, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Laptop: <Monitor className="h-5 w-5" />, Networking: <Wifi className="h-5 w-5" />,
  Monitor: <Monitor className="h-5 w-5" />, Peripheral: <Package className="h-5 w-5" />,
  Microcontroller: <Cpu className="h-5 w-5" />, Printer: <Printer className="h-5 w-5" />,
};

export default function EquipmentCatalog() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const equipment = useAppStore((s) => s.equipment);
  const bookings = useAppStore((s) => s.bookings);
  const createBooking = useAppStore((s) => s.createBooking);

  const userId = currentUser?.id || '';
  const role = currentUser?.role;
  const canBorrow = hasPermission(role, 'booking:create');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = Array.from(new Set(equipment.map((e) => e.category)));
  const filtered = equipment.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchCat = filterCategory === 'all' || e.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const myPendingIds = new Set(bookings.filter((b) => b.userId === userId && b.status === 'pending').map((b) => b.equipmentId));
  const myBorrowedIds = new Set(bookings.filter((b) => b.userId === userId && b.status === 'approved').map((b) => b.equipmentId));

  const handleBorrow = (eqId: string) => {
    if (!canBorrow) { toast.error('Unauthorized.'); return; }
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 7);
    createBooking(userId, eqId, dueDate.toISOString().split('T')[0]);
    logAudit('BOOKING_CREATED', userId, currentUser?.name || '', role || '', `Requested equipment ${eqId}`);
    toast.success('Borrow request submitted!');
  };

  const STATUS_COLORS: Record<string, string> = { available: 'bg-emerald-50 text-emerald-600 border-emerald-100', 'in-use': 'bg-blue-50 text-blue-600 border-blue-100', maintenance: 'bg-red-50 text-red-600 border-red-100' };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Equipment Catalog</h1>
        <p className="text-sm text-gray-500 mt-1">Browse available lab equipment and submit borrow requests.</p>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search equipment..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-11 px-4 pr-8 rounded-xl border border-gray-200 text-sm font-medium bg-white">
          <option value="all">All Status</option><option value="available">Available</option><option value="in-use">In Use</option><option value="maintenance">Maintenance</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="h-11 px-4 pr-8 rounded-xl border border-gray-200 text-sm font-medium bg-white">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p><p className="text-2xl font-bold text-gray-900 mt-1">{equipment.length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</p><p className="text-2xl font-bold text-emerald-600 mt-1">{equipment.filter((e) => e.status === 'available').length}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">My Borrowed</p><p className="text-2xl font-bold text-blue-600 mt-1">{myBorrowedIds.size}</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((eq) => {
          const isPending = myPendingIds.has(eq.id);
          const isBorrowed = myBorrowedIds.has(eq.id);
          return (
            <div key={eq.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-600">{CATEGORY_ICONS[eq.category] || <Package className="h-5 w-5" />}</div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{eq.name}</h3>
                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{eq.category} · {eq.lab}</p>
                    <span className={`inline-block mt-2 px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${STATUS_COLORS[eq.status]}`}>{eq.status}</span>
                  </div>
                </div>
                <div>
                  {isBorrowed ? <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">Borrowed</span>
                   : isPending ? <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">Pending</span>
                   : eq.status === 'available' && canBorrow ? <Button size="sm" className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-full text-xs font-bold" onClick={() => handleBorrow(eq.id)}><Plus className="h-3 w-3 mr-1" /> Borrow</Button>
                   : eq.status === 'available' ? <span className="flex items-center gap-1 text-gray-400 text-[10px] font-bold"><Lock className="h-3 w-3" /></span>
                   : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="text-center text-gray-400 py-8 font-medium">No equipment found.</p>}
    </div>
  );
}
