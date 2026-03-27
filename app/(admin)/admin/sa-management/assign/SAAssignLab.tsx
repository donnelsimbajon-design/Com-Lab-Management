"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { logAudit } from '@/lib/security/audit-log';
import { toast } from 'sonner';
import { MapPin, UserCheck, Trash2, History, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SAAssignLab() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const users = useAppStore((s) => s.users);
  const saAssignments = useAppStore((s) => s.saAssignments);
  const saAssignmentHistory = useAppStore((s) => s.saAssignmentHistory);
  const assignSA = useAppStore((s) => s.assignSA);
  const removeSAAssignment = useAppStore((s) => s.removeSAAssignment);

  const adminId = currentUser?.id || '';
  const saUsers = users.filter((u) => u.role === 'sa');

  const [editingSA, setEditingSA] = useState<string | null>(null);
  const [selectedLabs, setSelectedLabs] = useState<number[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const startEdit = (saId: string) => {
    const existing = saAssignments.find((a) => a.saId === saId);
    setSelectedLabs(existing?.labIds || []);
    setEditingSA(saId);
  };

  const toggleLab = (labId: number) => {
    if (selectedLabs.includes(labId)) {
      setSelectedLabs(selectedLabs.filter((l) => l !== labId));
    } else if (selectedLabs.length < 2) {
      setSelectedLabs([...selectedLabs, labId]);
    } else {
      toast.error('Each SA can be assigned to a maximum of 2 laboratories.');
    }
  };

  const handleSave = async () => {
    if (!editingSA || selectedLabs.length === 0) { toast.error('Select at least 1 lab.'); return; }
    const sa = saUsers.find((u) => u.id === editingSA);
    await assignSA(editingSA, sa?.name || '', selectedLabs, adminId);
    logAudit('SETTING_UPDATED', adminId, currentUser?.name || '', 'admin', `Assigned SA ${sa?.name} to Labs ${selectedLabs.join(', ')}`);
    toast.success(`${sa?.name} assigned to Lab${selectedLabs.length > 1 ? 's' : ''} ${selectedLabs.join(' & ')}`);
    setEditingSA(null);
    setSelectedLabs([]);
  };

  const handleRemove = async (saId: string) => {
    const sa = saUsers.find((u) => u.id === saId);
    await removeSAAssignment(saId, adminId);
    logAudit('SETTING_UPDATED', adminId, currentUser?.name || '', 'admin', `Removed SA ${sa?.name} assignment`);
    toast.success(`${sa?.name} assignment removed.`);
  };

  const labAssignments = Array.from({ length: 9 }, (_, i) => {
    const labId = i + 1;
    const sa = saAssignments.find((a) => a.isActive && a.labIds.includes(labId));
    return { labId, sa };
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">S.A. Assign Lab</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">Assign Student Assistants to laboratories. Each SA can manage up to 2 labs.</p>
      </div>

      {/* Lab Overview */}
      <div className="bg-[#f8fafc] border border-gray-100 rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-6">Laboratory Assignments Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {labAssignments.map(({ labId, sa }) => (
            <div key={labId} className={`p-4 rounded-2xl border ${sa ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900">Lab {labId}</span>
                <MapPin className={`h-3.5 w-3.5 ${sa ? 'text-emerald-500' : 'text-gray-300'}`} />
              </div>
              {sa ? (
                <div>
                  <p className="text-sm font-bold text-emerald-700">{sa.saName}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Since {new Date(sa.assignedAt).toLocaleDateString()}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-medium">Unassigned</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SA Assignment Cards */}
      <div className="bg-[#f8fafc] border border-gray-100 rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-6">Assign Student Assistants</h2>
        {saUsers.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No Student Assistants registered.</p>
        ) : (
          <div className="space-y-4">
            {saUsers.map((sa) => {
              const assignment = saAssignments.find((a) => a.saId === sa.id);
              const isEditing = editingSA === sa.id;
              return (
                <div key={sa.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                        {sa.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{sa.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{sa.schoolId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          Labs {assignment.labIds.join(' & ')}
                        </span>
                      )}
                      <Button size="sm" variant="outline" onClick={() => isEditing ? setEditingSA(null) : startEdit(sa.id)} className="rounded-xl text-xs font-bold">
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                      {assignment && (
                        <button onClick={() => handleRemove(sa.id)} className="text-gray-300 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-gray-50 animate-in slide-in-from-top duration-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Select Labs (max 2)</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.from({ length: 9 }, (_, i) => i + 1).map((labId) => (
                          <button
                            key={labId}
                            onClick={() => toggleLab(labId)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                              selectedLabs.includes(labId)
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-emerald-400'
                            }`}
                          >
                            Lab {labId}
                          </button>
                        ))}
                      </div>
                      <Button onClick={handleSave} className="bg-[#164ac9] hover:bg-blue-800 text-white rounded-xl font-bold px-6">
                        <UserCheck className="h-4 w-4 mr-2" /> Save Assignment
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assignment History */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <button onClick={() => setShowHistory(!showHistory)} className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">Assignment History</h2>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{saAssignmentHistory.length} entries</span>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
        </button>
        {showHistory && (
          <div className="p-6 pt-0">
            {saAssignmentHistory.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No history yet.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-3">SA Name</th><th className="pb-3">Action</th><th className="pb-3">Labs</th><th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-gray-700 divide-y divide-gray-50">
                  {saAssignmentHistory.slice(0, 50).map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-bold">{h.saName}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                          h.action === 'assigned' ? 'bg-emerald-50 text-emerald-600' : h.action === 'removed' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>{h.action}</span>
                      </td>
                      <td className="py-3 text-gray-500">{h.labIds.map((l) => `Lab ${l}`).join(', ')}</td>
                      <td className="py-3 text-gray-400 text-[11px]">{new Date(h.changedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
