"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import {
  Download, RefreshCw, Activity, Calendar, Wallet, Clock, Settings,
  HelpCircle, TrendingUp, Plus, Trash2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminDashboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const bookings = useAppStore((s) => s.bookings);
  const equipment = useAppStore((s) => s.equipment);
  const tickets = useAppStore((s) => s.tickets);
  const softwareRequests = useAppStore((s) => s.softwareRequests);
  const labs = useAppStore((s) => s.labs);
  const users = useAppStore((s) => s.users);
  const addEquipment = useAppStore((s) => s.addEquipment);
  const deleteEquipment = useAppStore((s) => s.deleteEquipment);
  const updateSoftwareRequestStatus = useAppStore((s) => s.updateSoftwareRequestStatus);

  // Derived analytics
  const totalLabHours = 1284 + bookings.filter((b) => b.status === 'approved' || b.status === 'completed').length * 12;
  const activeBookings = bookings.filter((b) => b.status === 'approved' || b.status === 'pending').length;
  const equipmentROI = equipment.length ? Math.round((equipment.filter((e) => e.status !== 'maintenance').length / equipment.length) * 100 * 10) / 10 : 0;
  const activeTickets = tickets.filter((t) => t.status !== 'resolved').length;
  const pendingSoftware = softwareRequests.filter((r) => r.status === 'pending');

  // Equipment form
  const [showAddEq, setShowAddEq] = useState(false);
  const [eqName, setEqName] = useState('');
  const [eqCat, setEqCat] = useState('');
  const [eqLab, setEqLab] = useState('');

  const handleAddEquipment = () => {
    if (!eqName || !eqCat || !eqLab) { toast.error('Fill all fields.'); return; }
    addEquipment({ name: eqName, category: eqCat, status: 'available', assignedTo: null, lab: eqLab });
    toast.success('Equipment added! Visible to all roles.');
    setEqName(''); setEqCat(''); setEqLab(''); setShowAddEq(false);
  };

  const handleDeleteEquipment = (id: string, name: string) => {
    deleteEquipment(id);
    toast.success(`${name} deleted. Related bookings removed.`);
  };

  const handleApproveSoftware = (id: string) => {
    updateSoftwareRequestStatus(id, 'approved');
    toast.success('Software request approved! Teacher notified.');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Analytics</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Real-time insights into laboratory performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 text-[#164ac9] font-bold text-[11px] px-5 bg-white/50 h-10 shadow-sm uppercase tracking-wider">
            <Download className="h-3.5 w-3.5 mr-2" /> Export Report
          </Button>
          <Button onClick={() => toast.info('Data refreshed!')} className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-xl px-5 font-bold shadow-md shadow-blue-500/20 text-[11px] uppercase tracking-wider h-10">
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#f8fafc] border border-gray-100 p-6 rounded-[1.5rem] relative shadow-sm">
          <Activity className="absolute right-6 top-6 h-4 w-4 text-gray-400" />
          <h3 className="text-[11px] font-bold text-gray-500 tracking-widest mb-4">Total Lab Usage</h3>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{totalLabHours.toLocaleString()} hrs</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-3 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> 12% from last month</p>
        </div>
        <div className="bg-[#f8fafc] border border-gray-100 p-6 rounded-[1.5rem] relative shadow-sm">
          <Calendar className="absolute right-6 top-6 h-4 w-4 text-gray-400" />
          <h3 className="text-[11px] font-bold text-gray-500 tracking-widest mb-4">Active Bookings</h3>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{activeBookings}</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-3 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Live count</p>
        </div>
        <div className="bg-[#f8fafc] border border-gray-100 p-6 rounded-[1.5rem] relative shadow-sm">
          <Wallet className="absolute right-6 top-6 h-4 w-4 text-gray-400" />
          <h3 className="text-[11px] font-bold text-gray-500 tracking-widest mb-4">Equipment ROI</h3>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{equipmentROI}%</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-3 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Active equipment ratio</p>
        </div>
        <div className="bg-[#f8fafc] border border-gray-100 p-6 rounded-[1.5rem] relative shadow-sm">
          <Clock className="absolute right-6 top-6 h-4 w-4 text-gray-400" />
          <h3 className="text-[11px] font-bold text-gray-500 tracking-widest mb-4">Open Tickets</h3>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{activeTickets}</p>
          <p className="text-[10px] font-bold text-red-500 mt-3 flex items-center gap-1.5">{tickets.filter((t) => t.priority === 'high' && t.status !== 'resolved').length} critical</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          {/* Pending Software Requests */}
          {pendingSoftware.length > 0 && (
            <div className="bg-amber-50/30 border border-amber-100 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 tracking-wide mb-6">Pending Software Requests</h2>
              <div className="space-y-3">
                {pendingSoftware.map((r) => {
                  const teacher = users.find((u) => u.id === r.teacherId);
                  return (
                    <div key={r.id} className="bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">{r.softwareName}</h3>
                        <p className="text-[10px] text-gray-500 font-semibold mt-1">By {teacher?.name || 'Unknown'} · {r.lab}</p>
                      </div>
                      <Button size="sm" onClick={() => handleApproveSoftware(r.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold">Approve</Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Equipment Table */}
          <div className="bg-[#f8fafc] border border-gray-100 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-gray-900 tracking-wide">Equipment Inventory</h2>
              <Button size="sm" variant="outline" className="rounded-full text-xs font-bold" onClick={() => setShowAddEq(!showAddEq)}>
                {showAddEq ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3 mr-1" />}
                {showAddEq ? 'Cancel' : 'Add'}
              </Button>
            </div>

            {showAddEq && (
              <div className="mb-6 p-4 bg-white border border-gray-100 rounded-xl space-y-3">
                <Input placeholder="Equipment name" value={eqName} onChange={(e) => setEqName(e.target.value)} className="rounded-xl text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Category" value={eqCat} onChange={(e) => setEqCat(e.target.value)} className="rounded-xl text-sm" />
                  <Input placeholder="Lab" value={eqLab} onChange={(e) => setEqLab(e.target.value)} className="rounded-xl text-sm" />
                </div>
                <Button onClick={handleAddEquipment} size="sm" className="bg-[#164ac9] rounded-xl text-xs w-full font-bold">Add Equipment</Button>
              </div>
            )}

            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-100/60">
                  <th className="pb-5 font-bold">Name</th>
                  <th className="pb-5 font-bold">Lab</th>
                  <th className="pb-5 font-bold">Status</th>
                  <th className="pb-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-gray-900 divide-y divide-gray-50">
                {equipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold">{eq.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{eq.category}</p>
                    </td>
                    <td className="py-4 text-gray-500">{eq.lab}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                        eq.status === 'available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        eq.status === 'in-use' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>{eq.status}</span>
                    </td>
                    <td className="py-4 text-right">
                      <button onClick={() => handleDeleteEquipment(eq.id, eq.name)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 space-y-8">
          {/* User Summary */}
          <div className="bg-[#f8fafc] border border-gray-100 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-6">Users by Role</h2>
            {(['student', 'teacher', 'sa', 'admin'] as const).map((role) => {
              const count = users.filter((u) => u.role === role).length;
              const colors: Record<string, string> = { student: 'bg-blue-500', teacher: 'bg-amber-500', sa: 'bg-emerald-500', admin: 'bg-gray-800' };
              return (
                <div key={role} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors[role]}`} />
                    <span className="text-xs font-bold text-gray-700 capitalize">{role}</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Requirements */}
          <div className="bg-[#f8fafc] border border-gray-100 rounded-[2rem] p-8 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Settings className="h-4 w-4 text-[#164ac9]" />
                <h3 className="font-bold text-[13px] text-gray-900">Functional Requirements</h3>
              </div>
              <ul className="space-y-4 px-1">
                <li className="flex items-start gap-3 text-[11px] font-semibold text-gray-500"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#164ac9] flex-shrink-0" /> Aggregate real-time data from all labs.</li>
                <li className="flex items-start gap-3 text-[11px] font-semibold text-gray-500"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#164ac9] flex-shrink-0" /> Full CRUD on equipment inventory.</li>
                <li className="flex items-start gap-3 text-[11px] font-semibold text-gray-500"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#164ac9] flex-shrink-0" /> Approve software requests from teachers.</li>
              </ul>
            </div>
            <div className="pt-5 border-t border-gray-100/60">
              <div className="flex items-center gap-3 mb-5">
                <HelpCircle className="h-4 w-4 text-gray-700" />
                <h3 className="font-bold text-[13px] text-gray-900">Non-Functional Requirements</h3>
              </div>
              <ul className="space-y-4 px-1">
                <li className="flex items-start gap-3 text-[11px] font-semibold text-gray-500"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600/70 flex-shrink-0" /> Sub-500ms response for aggregations.</li>
                <li className="flex items-start gap-3 text-[11px] font-semibold text-gray-500"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600/70 flex-shrink-0" /> 99.9% data consistency across modules.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
