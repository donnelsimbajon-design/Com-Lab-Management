import { create } from 'zustand';
import {
  User, Equipment, Booking, Ticket, SoftwareRequest, Report, Lab,
  BookingStatus, TicketStatus, EquipmentStatus, SoftwareRequestStatus,
} from './types';
import {
  MOCK_USERS, MOCK_EQUIPMENT, MOCK_BOOKINGS, MOCK_TICKETS,
  MOCK_SOFTWARE_REQUESTS, MOCK_REPORTS, MOCK_LABS,
} from './mock-data';

// ── Helper: generate unique IDs ──
let counter = 100;
const uid = (prefix: string) => `${prefix}${++counter}`;

// ── Simulated network delay ──
export const simulateDelay = () =>
  new Promise<void>((res) => setTimeout(res, 300 + Math.random() * 500));

// ── Simulated random error (5%) ──
export const maybeError = () => {
  if (Math.random() < 0.05) throw new Error('Simulated network error');
};

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

  // Loading
  isLoading: boolean;
  setLoading: (v: boolean) => void;

  // ── User Mutations ──
  addUser: (u: Omit<User, 'id'>) => string;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // ── Equipment Mutations ──
  addEquipment: (e: Omit<Equipment, 'id'>) => string;
  updateEquipment: (id: string, data: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  // ── Booking Mutations ──
  createBooking: (userId: string, equipmentId: string, dueDate: string) => string;
  updateBookingStatus: (id: string, status: BookingStatus) => void;

  // ── Ticket Mutations ──
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => string;
  updateTicketStatus: (id: string, status: TicketStatus) => void;

  // ── Software Request Mutations ──
  createSoftwareRequest: (req: Omit<SoftwareRequest, 'id' | 'createdAt'>) => string;
  updateSoftwareRequestStatus: (id: string, status: SoftwareRequestStatus) => void;

  // ── Report Mutations ──
  createReport: (report: Omit<Report, 'id' | 'createdAt'>) => string;

  // ── Lab Mutations ──
  updateLab: (id: string, data: Partial<Lab>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // ── Initial Data ──
  users: [...MOCK_USERS],
  equipment: [...MOCK_EQUIPMENT],
  bookings: [...MOCK_BOOKINGS],
  tickets: [...MOCK_TICKETS],
  softwareRequests: [...MOCK_SOFTWARE_REQUESTS],
  reports: [...MOCK_REPORTS],
  labs: [...MOCK_LABS],
  isLoading: false,

  setLoading: (v) => set({ isLoading: v }),

  // ── User ──
  addUser: (u) => {
    const id = uid('u');
    set((s) => ({ users: [...s.users, { ...u, id }] }));
    return id;
  },
  updateUser: (id, data) =>
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)) })),
  deleteUser: (id) =>
    set((s) => ({
      users: s.users.filter((u) => u.id !== id),
      bookings: s.bookings.filter((b) => b.userId !== id),
      tickets: s.tickets.filter((t) => t.userId !== id),
    })),

  // ── Equipment ──
  addEquipment: (e) => {
    const id = uid('eq');
    set((s) => ({ equipment: [...s.equipment, { ...e, id }] }));
    return id;
  },
  updateEquipment: (id, data) =>
    set((s) => ({ equipment: s.equipment.map((e) => (e.id === id ? { ...e, ...data } : e)) })),
  deleteEquipment: (id) =>
    set((s) => ({
      equipment: s.equipment.filter((e) => e.id !== id),
      // Cascade: remove related bookings
      bookings: s.bookings.filter((b) => b.equipmentId !== id),
    })),

  // ── Bookings ──
  createBooking: (userId, equipmentId, dueDate) => {
    const id = uid('b');
    set((s) => ({
      bookings: [
        ...s.bookings,
        { id, userId, equipmentId, status: 'pending' as BookingStatus, dueDate, createdAt: new Date().toISOString().split('T')[0] },
      ],
    }));
    return id;
  },
  updateBookingStatus: (id, status) =>
    set((s) => {
      const booking = s.bookings.find((b) => b.id === id);
      if (!booking) return {};

      const newBookings = s.bookings.map((b) => (b.id === id ? { ...b, status } : b));

      // ── SIDE EFFECTS ──
      let newEquipment = s.equipment;
      if (status === 'approved') {
        // Mark equipment as in-use
        newEquipment = s.equipment.map((e) =>
          e.id === booking.equipmentId ? { ...e, status: 'in-use' as EquipmentStatus, assignedTo: booking.userId } : e
        );
      } else if (status === 'completed' || status === 'denied') {
        // Release equipment
        newEquipment = s.equipment.map((e) =>
          e.id === booking.equipmentId ? { ...e, status: 'available' as EquipmentStatus, assignedTo: null } : e
        );
      }

      return { bookings: newBookings, equipment: newEquipment };
    }),

  // ── Tickets ──
  createTicket: (ticket) => {
    const id = uid('t');
    set((s) => ({
      tickets: [...s.tickets, { ...ticket, id, createdAt: new Date().toISOString().split('T')[0] }],
    }));
    return id;
  },
  updateTicketStatus: (id, status) =>
    set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)) })),

  // ── Software Requests ──
  createSoftwareRequest: (req) => {
    const id = uid('sr');
    set((s) => ({
      softwareRequests: [
        ...s.softwareRequests,
        { ...req, id, createdAt: new Date().toISOString().split('T')[0] },
      ],
    }));
    return id;
  },
  updateSoftwareRequestStatus: (id, status) =>
    set((s) => ({
      softwareRequests: s.softwareRequests.map((r) => (r.id === id ? { ...r, status } : r)),
    })),

  // ── Reports ──
  createReport: (report) => {
    const id = uid('r');
    set((s) => ({
      reports: [...s.reports, { ...report, id, createdAt: new Date().toISOString().split('T')[0] }],
    }));
    return id;
  },

  // ── Labs ──
  updateLab: (id, data) =>
    set((s) => ({ labs: s.labs.map((l) => (l.id === id ? { ...l, ...data } : l)) })),
}));
