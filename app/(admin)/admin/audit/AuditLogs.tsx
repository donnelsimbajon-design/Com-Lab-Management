"use client";

import React from 'react';
import { useAuditStore } from '@/lib/security/audit-log';
import { ShieldCheck } from 'lucide-react';

export default function AuditLogs() {
  const auditLogs = useAuditStore((s) => s.logs);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-[#164ac9]" /><div><h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1><p className="text-sm text-gray-500 mt-0.5">{auditLogs.length} entries tracked</p></div></div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto max-h-[70vh]">
        {auditLogs.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-sm">No audit events yet. Perform actions to see them here.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-10"><tr className="text-[9px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-100"><th className="p-4">Time</th><th className="p-4">Action</th><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Details</th><th className="p-4">IP</th></tr></thead>
            <tbody className="text-xs text-gray-700 divide-y divide-gray-50">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="p-4 text-gray-400 font-mono text-[10px] whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4"><span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest ${log.action.includes('UNAUTHORIZED') || log.action.includes('FAILED') ? 'bg-red-50 text-red-600' : log.action.includes('DELETED') || log.action.includes('DENIED') ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{log.action}</span></td>
                  <td className="p-4 font-semibold">{log.userName}</td>
                  <td className="p-4 text-gray-500 uppercase text-[9px] font-bold">{log.role}</td>
                  <td className="p-4 text-gray-500 max-w-[250px] truncate">{log.details}</td>
                  <td className="p-4 text-gray-400 font-mono text-[10px]">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
