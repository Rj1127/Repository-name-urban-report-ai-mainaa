-- Enums
CREATE TYPE public.app_role AS ENUM ('citizen', 'admin', 'resolver');
CREATE TYPE public.complaint_status AS ENUM ('new', 'assigned', 'in_progress', 'resolved');
CREATE TYPE public.issue_type AS ENUM ('pothole', 'garbage', 'blocked_drain', 'road_damage', 'waterlogging', 'other');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'citizen',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_roles_insert" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Role check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Complaints
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_type issue_type NOT NULL,
  description TEXT,
  image_url TEXT,
  resolution_image_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status complaint_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints_select_own" ON public.complaints FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "complaints_select_admin" ON public.complaints FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "complaints_insert" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "complaints_update_admin" ON public.complaints FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Assignments
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE UNIQUE,
  resolver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'assigned'
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments_admin" ON public.assignments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "assignments_resolver_select" ON public.assignments FOR SELECT TO authenticated USING (auth.uid() = resolver_id);
CREATE POLICY "assignments_resolver_update" ON public.assignments FOR UPDATE TO authenticated USING (auth.uid() = resolver_id);

-- Resolver policies on complaints (now assignments exists)
CREATE POLICY "complaints_select_resolver" ON public.complaints FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.assignments WHERE complaint_id = complaints.id AND resolver_id = auth.uid())
);
CREATE POLICY "complaints_update_resolver" ON public.complaints FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.assignments WHERE complaint_id = complaints.id AND resolver_id = auth.uid())
);

-- AI detections
CREATE TABLE public.ai_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  detected_issue issue_type NOT NULL,
  confidence_score DOUBLE PRECISION NOT NULL
);
ALTER TABLE public.ai_detections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "detections_select" ON public.ai_detections FOR SELECT TO authenticated USING (true);
CREATE POLICY "detections_insert" ON public.ai_detections FOR INSERT TO authenticated WITH CHECK (true);

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-images', 'complaint-images', true);
CREATE POLICY "complaint_images_select" ON storage.objects FOR SELECT USING (bucket_id = 'complaint-images');
CREATE POLICY "complaint_images_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'complaint-images');