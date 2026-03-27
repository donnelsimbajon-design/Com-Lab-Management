import { create } from 'zustand';
import {
  User, Equipment, Booking, Ticket, SoftwareRequest, Report, Lab, Schedule, SystemSetting,
  OpenLabSlot, SALabPermission, LabVisit, SAAssignment, SAAssignmentHistory, TeacherLabReport, AppNotification,
  BookingStatus, TicketStatus, EquipmentStatus, SoftwareRequestStatus,
} from './types';
import { supabase } from './supabase';

// ── Helper: generate unique IDs (fallback) ──
const uid = () => crypto.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ── Store Interface ──
export interface AppState {
  // Data
  users: User[];
  equipment: Equipment[];
  bookings: Booking[];
  tickets: Ticket[];
  softwareRequests: SoftwareRequest[];
  reports: Report[];
  labs: Lab[];
  schedules: Schedule[];
  settings: SystemSetting[];
  openLabSlots: OpenLabSlot[];
  saLabPermissions: SALabPermission[];
  labVisits: LabVisit[];
  saAssignments: SAAssignment[];
  saAssignmentHistory: SAAssignmentHistory[];
  teacherLabReports: TeacherLabReport[];
  notifications: AppNotification[];

  // Loading & Init
  isLoading: boolean;
  initialized: boolean;
  setLoading: (v: boolean) => void;
  initializeStore: () => Promise<void>;

  // ── User Mutations ──
  addUser: (u: Omit<User, 'id'>) => Promise<string>;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => Promise<void>;

  // ── Equipment Mutations ──
  addEquipment: (e: Omit<Equipment, 'id'>) => Promise<string>;
  updateEquipment: (id: string, data: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  // ── Booking Mutations ──
  createBooking: (userId: string, equipmentId: string, dueDate: string) => Promise<string>;
  updateBookingStatus: (id: string, status: BookingStatus) => void;

  // ── Ticket Mutations ──
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => Promise<string>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<void>;

  // ── Software Request Mutations ──
  createSoftwareRequest: (req: Omit<SoftwareRequest, 'id' | 'createdAt'>) => Promise<string>;
  updateSoftwareRequestStatus: (id: string, status: SoftwareRequestStatus) => Promise<void>;

  // ── Report Mutations ──
  createReport: (report: Omit<Report, 'id' | 'createdAt'>) => Promise<string>;

  // ── Lab Mutations ──
  updateLab: (id: string, data: Partial<Lab>) => void;

  // ── Schedule Mutations ──
  addSchedule: (s: Omit<Schedule, 'id'>) => Promise<string>;
  updateSchedule: (id: string, data: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => Promise<void>;

  // ── Settings Mutations ──
  updateSetting: (id: string, value: string) => Promise<void>;

  // ── Open Lab Slots ──
  addOpenLabSlot: (slot: Omit<OpenLabSlot, 'id'>) => string;
  updateOpenLabSlot: (id: string, data: Partial<OpenLabSlot>) => void;
  deleteOpenLabSlot: (id: string) => void;

  // ── SA Lab Permissions ──
  updateSALabPermission: (saId: string, labIds: number[]) => void;

  // ── Lab Visits ──
  enterLab: (userId: string, userName: string, userRole: string, labId: number) => string;
  leaveLab: (visitId: string) => void;
  getActiveVisit: (userId: string, labId: number) => LabVisit | undefined;

  // ── SA Assignments ──
  assignSA: (saId: string, saName: string, labIds: number[], adminId: string) => Promise<void>;
  removeSAAssignment: (saId: string, adminId: string) => Promise<void>;
  getSAForLab: (labId: number) => SAAssignment | undefined;

  // ── Teacher Lab Reports ──
  submitTeacherLabReport: (report: Omit<TeacherLabReport, 'id' | 'submittedAt' | 'saId' | 'saName'>) => Promise<string>;

  // ── Notifications ──
  createNotification: (userId: string, title: string, message: string, type: string, relatedTicketId?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;
}

// ── Mapper helpers: DB row → App type ──
function mapProfile(row: any): User {
  return {
    id: row.id,
    name: `${row.full_name} ${row.last_name}`,
    email: row.school_id + '@fsuu.edu',
    role: row.role,
    schoolId: row.school_id,
    birthday: row.birthday ? row.birthday.replace(/-/g, '').slice(4) + row.birthday.replace(/-/g, '').slice(0, 4) : '',
  };
}

function mapInventory(row: any): Equipment {
  return {
    id: row.id,
    name: row.name,
    category: row.description || 'General',
    status: row.status === 'loaned' ? 'in-use' : row.status as EquipmentStatus,
    assignedTo: null,
    lab: '',
  };
}

function mapLab(row: any): Lab {
  return {
    id: String(row.id),
    name: `Computer Lab ${row.id}`,
    location: '',
    totalUnits: row.capacity || 40,
    occupiedUnits: 0,
    status: row.status === 'in_use' ? 'occupied' : row.status === 'maintenance' ? 'maintenance' : 'available',
  };
}

function mapTicket(row: any): Ticket {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    lab: row.lab || '',
    createdAt: row.created_at?.split('T')[0] || '',
  };
}

function mapSoftwareRequest(row: any): SoftwareRequest {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    softwareName: row.software_name,
    lab: row.lab || '',
    status: row.status,
    createdAt: row.created_at?.split('T')[0] || '',
  };
}

function mapReport(row: any): Report {
  return {
    id: row.id,
    teacherId: row.reported_by,
    title: row.title,
    description: row.details?.description || '',
    createdAt: row.created_at?.split('T')[0] || '',
  };
}

function mapSchedule(row: any): Schedule {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    subject: row.subject,
    time: row.time_slot,
    lab: row.lab || '',
    day: row.day || '',
    status: row.status,
  };
}

function mapSetting(row: any): SystemSetting {
  return {
    id: row.id,
    key: row.key,
    value: row.value,
    category: row.category,
    updatedAt: row.updated_at?.split('T')[0] || '',
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  // ── Initial Data (empty until initializeStore is called) ──
  users: [],
  equipment: [],
  bookings: [],
  tickets: [],
  softwareRequests: [],
  reports: [],
  labs: [],
  schedules: [],
  settings: [],
  openLabSlots: [],
  saLabPermissions: [],
  labVisits: [],
  saAssignments: [],
  saAssignmentHistory: [],
  teacherLabReports: [],
  notifications: [],
  isLoading: false,
  initialized: false,

  createNotification: async () => {},
  markNotificationRead: async () => {},
  markAllNotificationsRead: async () => {},

  setLoading: (v) => set({ isLoading: v }),

  // ── Initialize: pull everything from Supabase ──
  initializeStore: async () => {
    if (get().initialized) return;
    set({ isLoading: true });
    try {
      const [
        profilesRes,
        inventoryRes,
        labsRes,
        ticketsRes,
        swRes,
        reportsRes,
        schedulesRes,
        settingsRes,
        labVisitsRes,
        openLabSlotsRes,
        saLabPermsRes,
        saAssignRes,
        saHistoryRes,
        teacherReportsRes,
        notificationsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('inventory').select('*'),
        supabase.from('laboratories').select('*').order('id'),
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('software_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('lab_reports').select('*').order('created_at', { ascending: false }),
        supabase.from('class_schedules').select('*'),
        supabase.from('system_settings').select('*'),
        supabase.from('lab_visits').select('*').order('entered_at', { ascending: false }),
        supabase.from('open_lab_slots').select('*'),
        supabase.from('sa_lab_permissions').select('*'),
        supabase.from('sa_assignments').select('*').eq('is_active', true),
        supabase.from('sa_assignment_history').select('*').order('changed_at', { ascending: false }),
        supabase.from('teacher_lab_reports').select('*').order('submitted_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      ]);

      const dbUsers = (profilesRes.data || []).map(mapProfile);

      // Fallback demo accounts so login always works, even with an empty DB
      const DEMO_USERS: User[] = [
        { id: '11111111-1111-1111-1111-111111111111', name: 'John Doe', email: 'john@fsuu.edu', role: 'student', schoolId: '2021-0452', birthday: '01152003' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Maria Santos', email: 'maria@fsuu.edu', role: 'student', schoolId: '2022-0101', birthday: '03221004' },
        { id: '33333333-3333-3333-3333-333333333333', name: 'Dr. Jane Doe', email: 'jane@fsuu.edu', role: 'teacher', schoolId: '2015-0010', birthday: '06101980' },
        { id: '44444444-4444-4444-4444-444444444444', name: 'Prof. Arts', email: 'arts@fsuu.edu', role: 'teacher', schoolId: '2014-0005', birthday: '09051975' },
        { id: '55555555-5555-5555-5555-555555555555', name: 'Alex Brown', email: 'alex@fsuu.edu', role: 'sa', schoolId: '2020-0300', birthday: '11202001' },
        { id: '66666666-6666-6666-6666-666666666666', name: 'Admin User', email: 'admin@fsuu.edu', role: 'admin', schoolId: 'ADMIN-001', birthday: '01011990' },
      ];

      // Merge: DB users first, then add demo users whose schoolId doesn't overlap
      const existingIds = new Set(dbUsers.map((u) => u.schoolId));
      const fallbackUsers = DEMO_USERS.filter((d) => !existingIds.has(d.schoolId));
      const allUsers = [...dbUsers, ...fallbackUsers];

      // Map DB rows to app types
      const dbSlots: OpenLabSlot[] = (openLabSlotsRes.data || []).map((r: any) => ({
        id: r.id, labId: r.lab_id, day: r.day, startTime: r.start_time, endTime: r.end_time,
      }));
      const dbPerms: SALabPermission[] = (saLabPermsRes.data || []).map((r: any) => ({
        saId: r.sa_id, labIds: r.lab_ids || [],
      }));
      const dbVisits: LabVisit[] = (labVisitsRes.data || []).map((r: any) => ({
        id: r.id, userId: r.user_id, userName: r.user_name, userRole: r.user_role,
        labId: r.lab_id, enteredAt: r.entered_at, leftAt: r.left_at, duration: r.duration,
      }));
      const dbAssignments: SAAssignment[] = (saAssignRes.data || []).map((r: any) => ({
        id: r.id, saId: r.sa_id, saName: r.sa_name, labIds: r.lab_ids || [],
        assignedBy: r.assigned_by || '', assignedAt: r.assigned_at, isActive: r.is_active,
      }));
      const dbHistory: SAAssignmentHistory[] = (saHistoryRes.data || []).map((r: any) => ({
        id: r.id, saId: r.sa_id, saName: r.sa_name, labIds: r.lab_ids || [],
        action: r.action, changedBy: r.changed_by || '', changedAt: r.changed_at,
      }));
      const dbTeacherReports: TeacherLabReport[] = (teacherReportsRes.data || []).map((r: any) => ({
        id: r.id, teacherId: r.teacher_id, teacherName: r.teacher_name,
        labId: r.lab_id, labName: r.lab_name, title: r.title,
        description: r.description || '', saId: r.sa_id, saName: r.sa_name,
        submittedAt: r.submitted_at,
      }));
      const dbNotifications: AppNotification[] = (notificationsRes.data || []).map((r: any) => ({
        id: r.id, userId: r.user_id, title: r.title, message: r.message,
        type: r.type, isRead: r.is_read, relatedTicketId: r.related_ticket_id,
        createdAt: r.created_at,
      }));

      set({
        users: allUsers,
        equipment: (inventoryRes.data || []).map(mapInventory),
        labs: (labsRes.data || []).map(mapLab),
        tickets: (ticketsRes.data || []).map(mapTicket),
        softwareRequests: (swRes.data || []).map(mapSoftwareRequest),
        reports: (reportsRes.data || []).map(mapReport),
        schedules: (schedulesRes.data || []).map(mapSchedule),
        settings: (settingsRes.data || []).map(mapSetting),
        bookings: [],
        openLabSlots: dbSlots,
        saLabPermissions: dbPerms,
        labVisits: dbVisits,
        saAssignments: dbAssignments,
        saAssignmentHistory: dbHistory,
        teacherLabReports: dbTeacherReports,
        notifications: dbNotifications,
        initialized: true,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to initialize store from Supabase:', err);
      set({ isLoading: false });
    }
  },

  // ── User ──
  addUser: async (u) => {
    const { data, error } = await supabase.from('profiles').insert({
      school_id: u.schoolId,
      full_name: u.name.split(' ')[0],
      last_name: u.name.split(' ').slice(1).join(' ') || '',
      birthday: u.birthday
        ? `${u.birthday.slice(4)}-${u.birthday.slice(0, 2)}-${u.birthday.slice(2, 4)}`
        : '2000-01-01',
      role: u.role,
    }).select().single();

    if (error || !data) {
      console.error('Failed to create account:', error);
      return '';
    }

    const id = data.id;
    set((s) => ({ users: [...s.users, { ...u, id }] }));
    return id;
  },

  updateUser: async (id, data) => {
    const dbUpdate: any = {};
    if (data.name) { dbUpdate.full_name = data.name.split(' ')[0]; dbUpdate.last_name = data.name.split(' ').slice(1).join(' '); }
    if (data.role) dbUpdate.role = data.role;
    if (data.schoolId) dbUpdate.school_id = data.schoolId;
    if (data.birthday) dbUpdate.birthday = `${data.birthday.slice(4)}-${data.birthday.slice(0,2)}-${data.birthday.slice(2,4)}`;
    if (Object.keys(dbUpdate).length > 0) await supabase.from('profiles').update(dbUpdate).eq('id', id);
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)) }));
  },

  deleteUser: async (id) => {
    await supabase.from('profiles').delete().eq('id', id);
    set((s) => ({
      users: s.users.filter((u) => u.id !== id),
      bookings: s.bookings.filter((b) => b.userId !== id),
      tickets: s.tickets.filter((t) => t.userId !== id),
    }));
  },

  // ── Equipment ──
  addEquipment: async (e) => {
    const { data, error } = await supabase.from('inventory').insert({
      name: e.name,
      description: e.category,
      serial_number: `SN-${Date.now()}`,
      status: e.status === 'in-use' ? 'loaned' : e.status,
    }).select().single();

    const id = data?.id || uid();
    set((s) => ({ equipment: [...s.equipment, { ...e, id }] }));
    return id;
  },

  updateEquipment: async (id, data) => {
    const dbUpdate: any = {};
    if (data.name) dbUpdate.name = data.name;
    if (data.category) dbUpdate.description = data.category;
    if (data.status) dbUpdate.status = data.status === 'in-use' ? 'loaned' : data.status;
    if (Object.keys(dbUpdate).length > 0) await supabase.from('inventory').update(dbUpdate).eq('id', id);
    set((s) => ({ equipment: s.equipment.map((e) => (e.id === id ? { ...e, ...data } : e)) }));
  },

  deleteEquipment: async (id) => {
    await supabase.from('inventory').delete().eq('id', id);
    set((s) => ({
      equipment: s.equipment.filter((e) => e.id !== id),
      bookings: s.bookings.filter((b) => b.equipmentId !== id),
    }));
  },

  // ── Bookings ──
  createBooking: async (userId, equipmentId, dueDate) => {
    const { data } = await supabase.from('bookings').insert({
      user_id: userId, equipment_id: equipmentId, status: 'pending', due_date: dueDate,
    }).select().single();
    const id = data?.id || uid();
    set((s) => ({
      bookings: [
        ...s.bookings,
        { id, userId, equipmentId, status: 'pending' as BookingStatus, dueDate, createdAt: new Date().toISOString().split('T')[0] },
      ],
    }));
    return id;
  },

  updateBookingStatus: async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    set((s) => {
      const booking = s.bookings.find((b) => b.id === id);
      if (!booking) return {};

      const newBookings = s.bookings.map((b) => (b.id === id ? { ...b, status } : b));

      let newEquipment = s.equipment;
      if (status === 'approved') {
        newEquipment = s.equipment.map((e) =>
          e.id === booking.equipmentId ? { ...e, status: 'in-use' as EquipmentStatus, assignedTo: booking.userId } : e
        );
        supabase.from('inventory').update({ status: 'loaned' }).eq('id', booking.equipmentId).then();
      } else if (status === 'completed' || status === 'denied') {
        newEquipment = s.equipment.map((e) =>
          e.id === booking.equipmentId ? { ...e, status: 'available' as EquipmentStatus, assignedTo: null } : e
        );
        supabase.from('inventory').update({ status: 'available' }).eq('id', booking.equipmentId).then();
      }

      return { bookings: newBookings, equipment: newEquipment };
    });
  },

  // ── Tickets ──
  createTicket: async (ticket) => {
    const { data, error } = await supabase.from('tickets').insert({
      user_id: ticket.userId,
      type: ticket.type,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      lab: ticket.lab,
    }).select().single();

    const id = data?.id || uid();
    const createdAt = data?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
    set((s) => ({
      tickets: [{ ...ticket, id, createdAt }, ...s.tickets],
    }));
    return id;
  },

  updateTicketStatus: async (id, status) => {
    await supabase.from('tickets').update({ status }).eq('id', id);
    set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)) }));
  },

  // ── Software Requests ──
  createSoftwareRequest: async (req) => {
    const { data, error } = await supabase.from('software_requests').insert({
      teacher_id: req.teacherId,
      software_name: req.softwareName,
      lab: req.lab,
      status: req.status,
    }).select().single();

    const id = data?.id || uid();
    const createdAt = data?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
    set((s) => ({
      softwareRequests: [{ ...req, id, createdAt }, ...s.softwareRequests],
    }));
    return id;
  },

  updateSoftwareRequestStatus: async (id, status) => {
    await supabase.from('software_requests').update({ status }).eq('id', id);
    set((s) => ({
      softwareRequests: s.softwareRequests.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  },

  // ── Reports ──
  createReport: async (report) => {
    const { data, error } = await supabase.from('lab_reports').insert({
      reported_by: report.teacherId,
      title: report.title,
      details: { description: report.description },
      laboratory_id: 1,
    }).select().single();

    const id = data?.id || uid();
    const createdAt = data?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
    set((s) => ({
      reports: [{ ...report, id, createdAt }, ...s.reports],
    }));
    return id;
  },

  // ── Labs ──
  updateLab: async (id, data) => {
    const dbUpdate: any = {};
    if (data.name) dbUpdate.name = data.name;
    if (data.status) dbUpdate.status = data.status;
    if (Object.keys(dbUpdate).length > 0) await supabase.from('laboratories').update(dbUpdate).eq('id', id);
    set((s) => ({ labs: s.labs.map((l) => (l.id === id ? { ...l, ...data } : l)) }));
  },

  // ── Schedules ──
  addSchedule: async (s_) => {
    const { data, error } = await supabase.from('class_schedules').insert({
      teacher_id: s_.teacherId,
      subject: s_.subject,
      time_slot: s_.time,
      lab: s_.lab,
      day: s_.day,
      status: s_.status,
    }).select().single();

    const id = data?.id || uid();
    set((s) => ({ schedules: [...s.schedules, { ...s_, id }] }));
    return id;
  },

  updateSchedule: async (id, data) => {
    const dbUpdate: any = {};
    if (data.subject) dbUpdate.subject = data.subject;
    if (data.time) dbUpdate.time_slot = data.time;
    if (data.lab) dbUpdate.lab = data.lab;
    if (data.day) dbUpdate.day = data.day;
    if (data.status) dbUpdate.status = data.status;
    if (Object.keys(dbUpdate).length > 0) await supabase.from('class_schedules').update(dbUpdate).eq('id', id);
    set((s) => ({ schedules: s.schedules.map((sc) => (sc.id === id ? { ...sc, ...data } : sc)) }));
  },

  deleteSchedule: async (id) => {
    await supabase.from('class_schedules').delete().eq('id', id);
    set((s) => ({ schedules: s.schedules.filter((sc) => sc.id !== id) }));
  },

  // ── Settings ──
  updateSetting: async (id, value) => {
    const setting = get().settings.find((s) => s.id === id);
    if (setting) {
      await supabase.from('system_settings').update({ value }).eq('id', id);
    }
    set((s) => ({
      settings: s.settings.map((st) => (st.id === id ? { ...st, value, updatedAt: new Date().toISOString().split('T')[0] } : st)),
    }));
  },

  // ── Open Lab Slots (Supabase-backed) ──
  addOpenLabSlot: (slot) => {
    const id = uid();
    // Persist to Supabase
    supabase.from('open_lab_slots').insert({
      id, lab_id: slot.labId, day: slot.day, start_time: slot.startTime, end_time: slot.endTime,
    }).then();
    set((s) => ({ openLabSlots: [...s.openLabSlots, { ...slot, id }] }));
    return id;
  },
  updateOpenLabSlot: (id, data) => {
    const dbUpdate: any = {};
    if (data.day) dbUpdate.day = data.day;
    if (data.startTime) dbUpdate.start_time = data.startTime;
    if (data.endTime) dbUpdate.end_time = data.endTime;
    if (data.labId) dbUpdate.lab_id = data.labId;
    supabase.from('open_lab_slots').update(dbUpdate).eq('id', id).then();
    set((s) => ({ openLabSlots: s.openLabSlots.map((sl) => (sl.id === id ? { ...sl, ...data } : sl)) }));
  },
  deleteOpenLabSlot: (id) => {
    supabase.from('open_lab_slots').delete().eq('id', id).then();
    set((s) => ({ openLabSlots: s.openLabSlots.filter((sl) => sl.id !== id) }));
  },

  // ── SA Lab Permissions (Supabase-backed) ──
  updateSALabPermission: (saId, labIds) => {
    // Upsert to Supabase
    supabase.from('sa_lab_permissions').upsert(
      { sa_id: saId, lab_ids: labIds },
      { onConflict: 'sa_id' }
    ).then();
    set((s) => {
      const existing = s.saLabPermissions.find((p) => p.saId === saId);
      if (existing) {
        return { saLabPermissions: s.saLabPermissions.map((p) => (p.saId === saId ? { ...p, labIds } : p)) };
      }
      return { saLabPermissions: [...s.saLabPermissions, { saId, labIds }] };
    });
  },

  // ── Lab Visits (Supabase-backed) ──
  enterLab: (userId, userName, userRole, labId) => {
    const id = uid();
    const enteredAt = new Date().toISOString();
    const visit: LabVisit = { id, userId, userName, userRole, labId, enteredAt, leftAt: null, duration: null };
    // Persist to Supabase
    supabase.from('lab_visits').insert({
      id, user_id: userId, user_name: userName, user_role: userRole,
      lab_id: labId, entered_at: enteredAt,
    }).then();
    set((s) => ({ labVisits: [visit, ...s.labVisits] }));
    return id;
  },
  leaveLab: (visitId) => {
    const visit = get().labVisits.find((v) => v.id === visitId);
    if (!visit || visit.leftAt) return;
    const leftAt = new Date().toISOString();
    const duration = Math.round((new Date(leftAt).getTime() - new Date(visit.enteredAt).getTime()) / 60000);
    // Persist to Supabase
    supabase.from('lab_visits').update({ left_at: leftAt, duration }).eq('id', visitId).then();
    set((s) => ({
      labVisits: s.labVisits.map((v) =>
        v.id === visitId ? { ...v, leftAt, duration } : v
      ),
    }));
  },
  getActiveVisit: (userId, labId) => {
    return get().labVisits.find((v) => v.userId === userId && v.labId === labId && !v.leftAt);
  },

  // ── SA Assignments (Supabase-backed) ──
  assignSA: async (saId, saName, labIds, adminId) => {
    // Deactivate any existing assignment for this SA
    await supabase.from('sa_assignments').update({ is_active: false }).eq('sa_id', saId);

    // Create new active assignment
    const { data } = await supabase.from('sa_assignments').insert({
      sa_id: saId, sa_name: saName, lab_ids: labIds, assigned_by: adminId, is_active: true,
    }).select().single();

    // Log history
    await supabase.from('sa_assignment_history').insert({
      sa_id: saId, sa_name: saName, lab_ids: labIds, action: 'assigned', changed_by: adminId,
    });

    const newAssignment: SAAssignment = {
      id: data?.id || uid(), saId, saName, labIds, assignedBy: adminId,
      assignedAt: new Date().toISOString(), isActive: true,
    };
    const historyEntry: SAAssignmentHistory = {
      id: uid(), saId, saName, labIds, action: 'assigned', changedBy: adminId,
      changedAt: new Date().toISOString(),
    };

    set((s) => ({
      saAssignments: [...s.saAssignments.filter((a) => a.saId !== saId), newAssignment],
      saAssignmentHistory: [historyEntry, ...s.saAssignmentHistory],
    }));
  },

  removeSAAssignment: async (saId, adminId) => {
    const existing = get().saAssignments.find((a) => a.saId === saId);
    await supabase.from('sa_assignments').update({ is_active: false }).eq('sa_id', saId);
    await supabase.from('sa_assignment_history').insert({
      sa_id: saId, sa_name: existing?.saName || '', lab_ids: existing?.labIds || [],
      action: 'removed', changed_by: adminId,
    });

    const historyEntry: SAAssignmentHistory = {
      id: uid(), saId, saName: existing?.saName || '', labIds: existing?.labIds || [],
      action: 'removed', changedBy: adminId, changedAt: new Date().toISOString(),
    };

    set((s) => ({
      saAssignments: s.saAssignments.filter((a) => a.saId !== saId),
      saAssignmentHistory: [historyEntry, ...s.saAssignmentHistory],
    }));
  },

  getSAForLab: (labId) => {
    return get().saAssignments.find((a) => a.isActive && a.labIds.includes(labId));
  },

  // ── Teacher Lab Reports (Supabase-backed) ──
  submitTeacherLabReport: async (report) => {
    // Auto-detect the SA on duty for this lab
    const saOnDuty = get().saAssignments.find((a) => a.isActive && a.labIds.includes(report.labId));

    const { data } = await supabase.from('teacher_lab_reports').insert({
      teacher_id: report.teacherId, teacher_name: report.teacherName,
      lab_id: report.labId, lab_name: report.labName,
      title: report.title, description: report.description,
      sa_id: saOnDuty?.saId || null, sa_name: saOnDuty?.saName || null,
    }).select().single();

    const id = data?.id || uid();
    const newReport: TeacherLabReport = {
      ...report, id, saId: saOnDuty?.saId || null, saName: saOnDuty?.saName || null,
      submittedAt: new Date().toISOString(),
    };

    set((s) => ({ teacherLabReports: [newReport, ...s.teacherLabReports] }));
    return id;
  },
}));
