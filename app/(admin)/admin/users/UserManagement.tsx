"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { hasPermission } from '@/lib/security/rbac';
import { sanitizeInput, containsScriptInjection } from '@/lib/security/sanitize';
import { toast } from 'sonner';
import { UserPlus, Search, Trash2, Edit, X, Save, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UserRole } from '@/lib/types';

export default function UserManagement() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const users = useAppStore((s) => s.users);
  const addUser = useAppStore((s) => s.addUser);
  const updateUser = useAppStore((s) => s.updateUser);
  const deleteUser = useAppStore((s) => s.deleteUser);
  const role = currentUser?.role;
  const canCreate = hasPermission(role, 'user:create');
  const canUpdate = hasPermission(role, 'user:update');
  const canDelete = hasPermission(role, 'user:delete');

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'student' as UserRole, schoolId: '', birthday: '' });

  const filtered = users.filter((u) => {
    const match = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return match && matchRole;
  });

  const handleAdd = () => {
    if (!canCreate) { toast.error('Unauthorized.'); return; }
    if (containsScriptInjection(form.name) || containsScriptInjection(form.email)) { toast.error('Invalid input.'); return; }
    const safe = { name: sanitizeInput(form.name), email: sanitizeInput(form.email), schoolId: sanitizeInput(form.schoolId), birthday: sanitizeInput(form.birthday) };
    if (!safe.name || !safe.email || !safe.schoolId || !safe.birthday) { toast.error('Fill required fields.'); return; }
    addUser({ ...safe, role: form.role });
    logAudit('USER_CREATED', currentUser?.id || '', currentUser?.name || '', role || '', `Created: ${safe.name} (${form.role})`);
    toast.success(`${safe.name} added!`);
    setForm({ name: '', email: '', role: 'student', schoolId: '', birthday: '' }); setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!canUpdate || !editId) return;
    if (containsScriptInjection(form.name)) { toast.error('Invalid input.'); return; }
    updateUser(editId, { name: sanitizeInput(form.name), email: sanitizeInput(form.email), role: form.role, schoolId: sanitizeInput(form.schoolId) });
    logAudit('USER_UPDATED', currentUser?.id || '', currentUser?.name || '', role || '', `Updated user ${editId}`);
    toast.success('User updated!');
    setEditId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (!canDelete) { toast.error('Unauthorized.'); return; }
    deleteUser(id);
    logAudit('USER_DELETED', currentUser?.id || '', currentUser?.name || '', role || '', `Deleted: ${name}`);
    toast.success(`${name} removed. Related data cascaded.`);
  };

  const startEdit = (u: typeof users[0]) => { setEditId(u.id); setForm({ name: u.name, email: u.email, role: u.role, schoolId: u.schoolId, birthday: u.birthday }); };

  const ROLE_COLORS: Record<string, string> = { student: 'text-blue-600 bg-blue-50', teacher: 'text-amber-600 bg-amber-50', sa: 'text-emerald-600 bg-emerald-50', admin: 'text-gray-800 bg-gray-100' };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">User Management</h1><p className="text-sm text-gray-500 mt-1">Full CRUD on system users.</p></div>
        {canCreate ? <Button onClick={() => setShowAdd(!showAdd)} className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-xl px-5 font-bold shadow-md"><UserPlus className="h-4 w-4 mr-2" /> Add User</Button> : <Button disabled className="opacity-50 rounded-xl"><Lock className="h-4 w-4 mr-2" /> No Permission</Button>}
      </div>
      {showAdd && canCreate && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" />
            <Input placeholder="School ID" value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} className="rounded-xl" />
            <Input placeholder="Birthday (MMDDYYYY)" type="text" maxLength={8} value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value.replace(/[^0-9]/g, '') })} className="rounded-xl" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="h-10 px-4 rounded-xl border border-gray-200 text-sm bg-white"><option value="student">Student</option><option value="teacher">Teacher</option><option value="sa">Student Assistant</option><option value="admin">Admin</option></select>
          </div>
          <div className="flex gap-3"><Button onClick={handleAdd} className="bg-[#164ac9] text-white rounded-xl font-bold"><Save className="h-4 w-4 mr-2" /> Create</Button><Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Cancel</Button></div>
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" /></div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="h-11 px-4 pr-8 rounded-xl border border-gray-200 text-sm bg-white"><option value="all">All Roles</option><option value="student">Student</option><option value="teacher">Teacher</option><option value="sa">SA</option><option value="admin">Admin</option></select>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="text-[10px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-100"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">School ID</th><th className="p-4">Birthday</th><th className="p-4">Role</th><th className="p-4 text-right">Actions</th></tr></thead>
          <tbody className="text-sm text-gray-900 divide-y divide-gray-50">
            {filtered.map((u) => editId === u.id ? (
              <tr key={u.id} className="bg-blue-50/30">
                <td className="p-3"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg h-8 text-sm" /></td>
                <td className="p-3"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg h-8 text-sm" /></td>
                <td className="p-3"><Input value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} className="rounded-lg h-8 text-sm" /></td>
                <td className="p-3"><Input value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} maxLength={8} className="rounded-lg h-8 text-sm" /></td>
                <td className="p-3"><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="h-8 px-2 rounded-lg border text-sm bg-white"><option value="student">Student</option><option value="teacher">Teacher</option><option value="sa">SA</option><option value="admin">Admin</option></select></td>
                <td className="p-3 text-right flex gap-2 justify-end"><Button size="sm" onClick={handleUpdate} className="bg-[#164ac9] text-white rounded-lg text-xs"><Save className="h-3 w-3" /></Button><Button size="sm" variant="outline" onClick={() => setEditId(null)} className="rounded-lg text-xs"><X className="h-3 w-3" /></Button></td>
              </tr>
            ) : (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-bold">{u.name}</td><td className="p-4 text-gray-500">{u.email}</td><td className="p-4 text-gray-500">{u.schoolId}</td><td className="p-4 text-gray-500">{u.birthday || 'N/A'}</td>
                <td className="p-4"><span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${ROLE_COLORS[u.role]}`}>{u.role}</span></td>
                <td className="p-4 text-right flex gap-2 justify-end">
                  {canUpdate && <button onClick={() => startEdit(u)} className="text-gray-400 hover:text-blue-500"><Edit className="h-4 w-4" /></button>}
                  {canDelete && <button onClick={() => handleDelete(u.id, u.name)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
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
