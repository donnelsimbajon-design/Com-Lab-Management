// ── Zod Validation Schemas for All Forms ──

import { z } from 'zod';

export const loginSchema = z.object({
  schoolId: z.string().min(1, 'ID number is required').max(20, 'ID too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const bookingSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  dueDate: z.string().min(1, 'Due date is required'),
});

export const ticketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(500, 'Description too long'),
  type: z.enum(['incident', 'lost-item', 'hardware', 'software']),
  priority: z.enum(['high', 'medium', 'low']),
  lab: z.string().min(1, 'Lab is required'),
});

export const softwareRequestSchema = z.object({
  softwareName: z.string().min(2, 'Software name is required').max(100),
  lab: z.string().min(1, 'Lab is required'),
});

export const reportSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
});

export const equipmentSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  category: z.string().min(2, 'Category is required'),
  lab: z.string().min(1, 'Lab is required'),
});

export const userSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['student', 'teacher', 'sa', 'admin']),
  schoolId: z.string().min(1, 'School ID is required'),
  birthday: z.string().min(8, 'Birthday is required (MMDDYYYY)').max(8),
});

/** Validate data against a schema, returning safe error messages */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((e: z.ZodIssue) => e.message),
  };
}
