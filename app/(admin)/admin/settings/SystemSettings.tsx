"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { hasPermission } from '@/lib/security/rbac';
import { toast } from 'sonner';
import { Settings, Save, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SystemSettings() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const settings = useAppStore((s) => s.settings);
  const updateSetting = useAppStore((s) => s.updateSetting);
  const role = currentUser?.role;
  const canEdit = hasPermission(role, 'settings:manage');

  const categories = Array.from(new Set(settings.map((s) => s.category)));

  const handleUpdate = (id: string, value: string, key: string) => {
    if (!canEdit) { toast.error('Unauthorized.'); return; }
    updateSetting(id, value);
    logAudit('SETTING_UPDATED', currentUser?.id || '', currentUser?.name || '', role || '', `${key} → ${value}`);
    toast.success(`${key} updated!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3"><Settings className="h-6 w-6 text-[#164ac9]" /><div><h1 className="text-2xl font-bold text-gray-900">System Settings</h1><p className="text-sm text-gray-500 mt-0.5">Configure global system parameters.</p></div></div>
      {categories.map((cat) => (
        <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50"><h2 className="font-bold text-sm text-gray-900">{cat}</h2></div>
          <div className="divide-y divide-gray-50">
            {settings.filter((s) => s.category === cat).map((s) => (
              <div key={s.id} className="p-5 flex items-center justify-between">
                <div><p className="font-semibold text-sm text-gray-900">{s.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p><p className="text-[10px] text-gray-400 mt-0.5">Updated: {s.updatedAt}</p></div>
                <div className="flex items-center gap-3">
                  {canEdit ? (
                    <>
                      <Input defaultValue={s.value} onBlur={(e) => { if (e.target.value !== s.value) handleUpdate(s.id, e.target.value, s.key); }} className="w-40 h-9 rounded-xl text-sm text-right" />
                    </>
                  ) : (
                    <div className="flex items-center gap-2"><span className="text-sm font-bold text-gray-700">{s.value}</span><Lock className="h-4 w-4 text-gray-300" /></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
