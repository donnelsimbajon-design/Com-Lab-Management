import { User, Equipment, Booking, Ticket, SoftwareRequest, Report, Lab } from './types';

// ── USERS ──
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'John Doe', email: 'john@fsuu.edu', role: 'student', schoolId: '2021-0452', birthday: '01152003' },
  { id: 'u2', name: 'Maria Santos', email: 'maria@fsuu.edu', role: 'student', schoolId: '2022-0101', birthday: '03221004' },
  { id: 'u3', name: 'Dr. Jane Doe', email: 'jane@fsuu.edu', role: 'teacher', schoolId: '2015-0010', birthday: '06101980' },
  { id: 'u4', name: 'Prof. Arts', email: 'arts@fsuu.edu', role: 'teacher', schoolId: '2014-0005', birthday: '09051975' },
  { id: 'u5', name: 'Alex Brown', email: 'alex@fsuu.edu', role: 'sa', schoolId: '2020-0300', birthday: '11202001' },
  { id: 'u6', name: 'Admin User', email: 'admin@fsuu.edu', role: 'admin', schoolId: 'ADMIN-001', birthday: '01011990' },
];

// ── EQUIPMENT ──
export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq1', name: 'MacBook Pro #14', category: 'Laptop', status: 'in-use', assignedTo: 'u1', lab: 'Lab 1' },
  { id: 'eq2', name: 'Cisco Router V2', category: 'Networking', status: 'in-use', assignedTo: 'u1', lab: 'Lab 3' },
  { id: 'eq3', name: 'Dell Monitor 27"', category: 'Monitor', status: 'available', assignedTo: null, lab: 'Lab 2' },
  { id: 'eq4', name: 'Logitech Webcam C920', category: 'Peripheral', status: 'available', assignedTo: null, lab: 'Lab 1' },
  { id: 'eq5', name: 'Arduino Mega Kit', category: 'Microcontroller', status: 'maintenance', assignedTo: null, lab: 'Lab 5' },
  { id: 'eq6', name: 'HP LaserJet Printer', category: 'Printer', status: 'available', assignedTo: null, lab: 'Lab 2' },
  { id: 'eq7', name: 'Raspberry Pi 4B', category: 'Microcontroller', status: 'available', assignedTo: null, lab: 'Lab 4' },
  { id: 'eq8', name: 'USB-C Hub Adapter', category: 'Peripheral', status: 'in-use', assignedTo: 'u2', lab: 'Lab 1' },
];

// ── BOOKINGS ──
export const MOCK_BOOKINGS: Booking[] = [
  { id: 'b1', userId: 'u1', equipmentId: 'eq1', status: 'approved', dueDate: '2025-10-25', createdAt: '2025-10-18' },
  { id: 'b2', userId: 'u1', equipmentId: 'eq2', status: 'approved', dueDate: '2025-10-30', createdAt: '2025-10-20' },
  { id: 'b3', userId: 'u2', equipmentId: 'eq8', status: 'approved', dueDate: '2025-11-05', createdAt: '2025-10-22' },
  { id: 'b4', userId: 'u2', equipmentId: 'eq3', status: 'pending', dueDate: '2025-11-10', createdAt: '2025-10-24' },
];

// ── TICKETS ──
export const MOCK_TICKETS: Ticket[] = [
  { id: 't1', userId: 'u4', type: 'hardware', title: 'PC-04 Blue Screen', description: 'System crashes immediately after login. Suspected RAM failure.', status: 'in-progress', priority: 'high', lab: 'Lab 1 - Station 04', createdAt: '2025-10-23' },
  { id: 't2', userId: 'u3', type: 'hardware', title: 'Projector Dimming', description: 'The projector in Lab 5 is very dim, making it hard to see code during lectures.', status: 'open', priority: 'medium', lab: 'Lab 5 - Main', createdAt: '2025-10-22' },
  { id: 't3', userId: 'u1', type: 'software', title: 'Software Update Request', description: 'Requesting VS Code update to latest version on all Lab 2 machines.', status: 'open', priority: 'low', lab: 'Lab 2 - All Units', createdAt: '2025-10-21' },
];

// ── SOFTWARE REQUESTS ──
export const MOCK_SOFTWARE_REQUESTS: SoftwareRequest[] = [
  { id: 'sr1', teacherId: 'u3', softwareName: 'VS Code Extensions', lab: 'Lab 302', status: 'pending', createdAt: '2025-10-20' },
  { id: 'sr2', teacherId: 'u3', softwareName: 'Docker Desktop', lab: 'Lab 101', status: 'approved', createdAt: '2025-10-19' },
  { id: 'sr3', teacherId: 'u4', softwareName: 'Wireshark Pro', lab: 'Lab 3', status: 'pending', createdAt: '2025-10-23' },
];

// ── REPORTS ──
export const MOCK_REPORTS: Report[] = [
  { id: 'r1', teacherId: 'u3', title: 'Lab Report: CS 101', description: 'Weekly progress report for CS101 class activities.', createdAt: '2025-10-24' },
];

// ── LABS ──
export const MOCK_LABS: Lab[] = [
  { id: 'l1', name: 'Computer Lab 1', location: 'Main Bldg, 2nd Floor', totalUnits: 40, occupiedUnits: 28, status: 'available' },
  { id: 'l2', name: 'Computer Lab 2', location: 'Main Bldg, 2nd Floor', totalUnits: 35, occupiedUnits: 10, status: 'available' },
  { id: 'l3', name: 'Advanced Networking Lab', location: 'Science Wing', totalUnits: 25, occupiedUnits: 23, status: 'available' },
  { id: 'l4', name: 'Hardware Laboratory', location: 'Tech Bldg, 1st Floor', totalUnits: 20, occupiedUnits: 9, status: 'available' },
  { id: 'l5', name: 'Multimedia Lab', location: 'Main Bldg, 3rd Floor', totalUnits: 30, occupiedUnits: 15, status: 'available' },
  { id: 'l6', name: 'Network Simulation Room', location: 'Science Wing, 2nd Floor', totalUnits: 20, occupiedUnits: 16, status: 'available' },
  { id: 'l7', name: 'Research Hub', location: 'Library Bldg', totalUnits: 15, occupiedUnits: 2, status: 'available' },
  { id: 'l8', name: 'Software Dev Lab', location: 'Main Bldg, 4th Floor', totalUnits: 30, occupiedUnits: 22, status: 'occupied' },
  { id: 'l9', name: 'IoT Lab', location: 'Tech Bldg, 2nd Floor', totalUnits: 15, occupiedUnits: 5, status: 'available' },
];
