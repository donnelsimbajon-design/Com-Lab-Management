// ── Core Entity Types for ComLab Connect ──

export type UserRole = 'student' | 'teacher' | 'sa' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  birthday: string; // MMDDYYYY
}

export type EquipmentStatus = 'available' | 'in-use' | 'maintenance';

export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  assignedTo: string | null; // userId
  lab: string;
}

export type BookingStatus = 'pending' | 'approved' | 'denied' | 'completed';

export interface Booking {
  id: string;
  userId: string;
  equipmentId: string;
  status: BookingStatus;
  dueDate: string;
  createdAt: string;
}

export type AuditAction =
  | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT'
  | 'UNAUTHORIZED_ACCESS' | 'EQUIPMENT_ADDED' | 'EQUIPMENT_UPDATED' | 'EQUIPMENT_DELETED'
  | 'BOOKING_CREATED' | 'BOOKING_APPROVED' | 'BOOKING_DENIED'
  | 'TICKET_CREATED' | 'TICKET_RESOLVED' | 'TICKET_ESCALATED'
  | 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED'
  | 'SOFTWARE_REQUESTED' | 'SOFTWARE_APPROVED' | 'SOFTWARE_DENIED'
  | 'SETTING_UPDATED';

export type Permission =
  | 'inventory:read' | 'inventory:create' | 'inventory:update' | 'inventory:delete'
  | 'booking:create' | 'booking:approve' | 'booking:view'
  | 'ticket:create' | 'ticket:update' | 'ticket:view'
  | 'report:create' | 'report:view'
  | 'software:request' | 'software:approve' | 'software:view'
  | 'user:create' | 'user:update' | 'user:delete' | 'user:view'
  | 'settings:update';

export type TicketPriority = 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in-progress' | 'resolved';
export type TicketType = 'incident' | 'lost-item' | 'hardware' | 'software';

export interface Ticket {
  id: string;
  userId: string;
  type: TicketType;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  lab: string;
  createdAt: string;
}

export type SoftwareRequestStatus = 'pending' | 'approved' | 'installed' | 'denied';

export interface SoftwareRequest {
  id: string;
  teacherId: string;
  softwareName: string;
  lab: string;
  status: SoftwareRequestStatus;
  createdAt: string;
}

export interface Report {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Lab {
  id: string;
  name: string;
  location: string;
  totalUnits: number;
  occupiedUnits: number;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface Schedule {
  id: string;
  teacherId: string;
  subject: string;
  time: string;
  lab: string;
  day: string;
  status: 'ongoing' | 'upcoming' | 'completed';
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

export interface OpenLabSlot {
  id: string;
  labId: number;
  day: string; // e.g. 'Monday', 'Tuesday'
  startTime: string; // e.g. '08:00'
  endTime: string;   // e.g. '17:00'
}

export interface SALabPermission {
  saId: string;
  labIds: number[];
}

export interface LabVisit {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  labId: number;
  enteredAt: string; // ISO timestamp
  leftAt: string | null;
  duration: number | null; // minutes
}
