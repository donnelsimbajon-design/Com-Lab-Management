-- Create custom Enum type for roles
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'sa', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birthday DATE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create laboratories table
CREATE TYPE lab_status AS ENUM ('available', 'in_use', 'maintenance');

CREATE TABLE public.laboratories (
  id INT NOT NULL PRIMARY KEY CHECK (id >= 1 AND id <= 9),
  capacity INT NOT NULL DEFAULT 40,
  status lab_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on laboratories
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;

-- Create bookings table
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled');

CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  laboratory_id INT NOT NULL REFERENCES public.laboratories(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create inventory table
CREATE TYPE inventory_status AS ENUM ('available', 'loaned', 'maintenance');

CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status inventory_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on inventory
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create inventory_loans table for check-in/out logic
CREATE TABLE public.inventory_loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  borrowed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_return_at TIMESTAMPTZ NOT NULL,
  returned_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on inventory_loans
ALTER TABLE public.inventory_loans ENABLE ROW LEVEL SECURITY;

-- Create lab_reports table
CREATE TYPE report_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

CREATE TABLE public.lab_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  laboratory_id INT NOT NULL REFERENCES public.laboratories(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status report_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on lab_reports
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

-- Create lost_found table
CREATE TYPE lost_found_status AS ENUM ('reported', 'claimed', 'disposed');

CREATE TABLE public.lost_found (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  laboratory_id INT NOT NULL REFERENCES public.laboratories(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT, -- from Supabase Storage
  status lost_found_status NOT NULL DEFAULT 'reported',
  claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on lost_found
ALTER TABLE public.lost_found ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (can be refined later if needed)

-- Profiles: Anyone can read profiles (or we restrict to authenticated)
CREATE POLICY "Public profiles are viewable by authenticated users."
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Laboratories: Viewable by anyone
CREATE POLICY "Laboratories are viewable by authenticated users."
  ON public.laboratories FOR SELECT
  TO authenticated
  USING (true);

-- Bookings: Viewable by anyone (to check availability). Update/Delete by owner or admin.
CREATE POLICY "Bookings viewable by authenticated users"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own bookings."
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own bookings."
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id);

-- Inventory: Viewable by authenticated
CREATE POLICY "Inventory is viewable by authenticated users."
  ON public.inventory FOR SELECT
  TO authenticated
  USING (true);

-- Loans: Viewable by authenticated
CREATE POLICY "Loans viewable by authenticated users"
  ON public.inventory_loans FOR SELECT
  TO authenticated
  USING (true);

-- Lab Reports: Viewable by authenticated
CREATE POLICY "Lab reports viewable by authenticated users"
  ON public.lab_reports FOR SELECT
  TO authenticated
  USING (true);

-- Lost and Found: Viewable by authenticated
CREATE POLICY "Lost and found viewable by authenticated users"
  ON public.lost_found FOR SELECT
  TO authenticated
  USING (true);
