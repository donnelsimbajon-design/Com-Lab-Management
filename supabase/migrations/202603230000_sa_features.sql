-- Migration to create the Lab Assignments and SA Schedules tables

-- Create Lab Assignments Table
CREATE TABLE public.lab_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id INT NOT NULL REFERENCES public.laboratories(id) ON DELETE CASCADE,
  sa_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lab_id, sa_id)
);

-- Enable RLS
ALTER TABLE public.lab_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lab assignments are viewable by authenticated users."
  ON public.lab_assignments FOR SELECT TO authenticated USING (true);


-- Create SA Schedules Table
CREATE TABLE public.sa_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sa_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lab_id INT NOT NULL REFERENCES public.laboratories(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday...
  start_time TIME NOT NULL, -- e.g. '08:00'
  end_time TIME NOT NULL,   -- e.g. '12:00'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sa_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SA schedules are viewable by authenticated users."
  ON public.sa_schedules FOR SELECT TO authenticated USING (true);


-- =========================================
-- SEED DATA (Run this once to fix "No laboratories found" error)
-- =========================================
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

