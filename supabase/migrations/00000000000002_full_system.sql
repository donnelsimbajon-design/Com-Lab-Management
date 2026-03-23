-- =============================================
-- Full System Tables Migration
-- Creates tickets, software_requests, class_schedules, system_settings
-- Also seeds laboratories 1-9
-- =============================================

-- Tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('incident', 'lost-item', 'hardware', 'software')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  lab TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tickets viewable by authenticated" ON public.tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update tickets" ON public.tickets FOR UPDATE TO authenticated USING (true);

-- Software Requests table
CREATE TABLE IF NOT EXISTS public.software_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  software_name TEXT NOT NULL,
  lab TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'installed', 'denied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.software_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SW requests viewable by authenticated" ON public.software_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can create SW requests" ON public.software_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "SW requests can be updated" ON public.software_requests FOR UPDATE TO authenticated USING (true);

-- Class Schedules table
CREATE TABLE IF NOT EXISTS public.class_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  lab TEXT NOT NULL DEFAULT '',
  day TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('ongoing', 'upcoming', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schedules viewable by authenticated" ON public.class_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Schedules can be created" ON public.class_schedules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Schedules can be updated" ON public.class_schedules FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Schedules can be deleted" ON public.class_schedules FOR DELETE TO authenticated USING (true);

-- System Settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'System',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings viewable by authenticated" ON public.system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Settings can be updated" ON public.system_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Settings can be inserted" ON public.system_settings FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- Seed Laboratories 1-9
-- =============================================
INSERT INTO public.laboratories (id, capacity, status)
VALUES
  (1, 40, 'available'),
  (2, 40, 'available'),
  (3, 40, 'available'),
  (4, 40, 'available'),
  (5, 40, 'available'),
  (6, 40, 'available'),
  (7, 40, 'available'),
  (8, 40, 'available'),
  (9, 40, 'available')
ON CONFLICT (id) DO NOTHING;

-- Seed default system settings
INSERT INTO public.system_settings (key, value, category)
VALUES
  ('session_timeout', '30', 'Security'),
  ('max_borrow_days', '7', 'Booking'),
  ('max_login_attempts', '5', 'Security'),
  ('maintenance_mode', 'false', 'System'),
  ('notification_email', 'admin@fsuu.edu', 'Notifications'),
  ('auto_approve_bookings', 'false', 'Booking')
ON CONFLICT (key) DO NOTHING;
