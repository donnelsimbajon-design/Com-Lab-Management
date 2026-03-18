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
