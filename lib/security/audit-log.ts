// ── Audit Logging System ──

import { create } from 'zustand';

export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
  | 'BOOKING_CREATED' | 'BOOKING_APPROVED' | 'BOOKING_DENIED' | 'BOOKING_COMPLETED'
  | 'TICKET_CREATED' | 'TICKET_RESOLVED' | 'TICKET_ESCALATED'
  | 'EQUIPMENT_ADDED' | 'EQUIPMENT_DELETED' | 'EQUIPMENT_UPDATED'
  | 'SOFTWARE_REQUESTED' | 'SOFTWARE_APPROVED'
  | 'REPORT_SUBMITTED'
  | 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED'
  | 'UNAUTHORIZED_ACCESS' | 'CSRF_VIOLATION' | 'SETTING_UPDATED';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  userId: string;
  userName: string;
  role: string;
  details: string;
  timestamp: string;
  ip: string; // simulated
}

interface AuditStore {
  logs: AuditEntry[];
  addLog: (entry: Omit<AuditEntry, 'id' | 'timestamp' | 'ip'>) => void;
  clearLogs: () => void;
}

let auditCounter = 0;

export const useAuditStore = create<AuditStore>((set) => ({
  logs: [],
  addLog: (entry) =>
    set((s) => ({
      logs: [
        {
          ...entry,
          id: `audit_${++auditCounter}`,
          timestamp: new Date().toISOString(),
          ip: '192.168.1.' + Math.floor(Math.random() * 255), // simulated
        },
        ...s.logs,
      ].slice(0, 200), // Keep last 200 entries
    })),
  clearLogs: () => set({ logs: [] }),
}));

/** Convenience: log an action */
export function logAudit(
  action: AuditAction,
  userId: string,
  userName: string,
  role: string,
  details: string
) {
  useAuditStore.getState().addLog({ action, userId, userName, role, details });
}
