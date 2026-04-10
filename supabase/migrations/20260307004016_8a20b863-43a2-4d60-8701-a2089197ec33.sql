
-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '190 80% 45%',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lecture', 'section', 'resource')),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  pdf_url TEXT,
  pdf_display_name TEXT,
  external_link TEXT,
  deadline TEXT,
  is_assignment BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create important_links table
CREATE TABLE public.important_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT,
  url TEXT NOT NULL,
  is_persistent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create moderators table
CREATE TABLE public.moderators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all',
  link TEXT,
  sent_by TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public read access for student-facing tables
CREATE POLICY "Anyone can read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Anyone can read materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Anyone can read links" ON public.important_links FOR SELECT USING (true);
CREATE POLICY "Anyone can read notifications" ON public.notifications FOR SELECT USING (true);

-- Admin write access (custom auth system, not Supabase Auth)
CREATE POLICY "Admins can insert courses" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update courses" ON public.courses FOR UPDATE USING (true);
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE USING (true);

CREATE POLICY "Admins can insert materials" ON public.materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update materials" ON public.materials FOR UPDATE USING (true);
CREATE POLICY "Admins can delete materials" ON public.materials FOR DELETE USING (true);

CREATE POLICY "Admins can insert links" ON public.important_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update links" ON public.important_links FOR UPDATE USING (true);
CREATE POLICY "Admins can delete links" ON public.important_links FOR DELETE USING (true);

CREATE POLICY "Admins can insert moderators" ON public.moderators FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update moderators" ON public.moderators FOR UPDATE USING (true);
CREATE POLICY "Admins can delete moderators" ON public.moderators FOR DELETE USING (true);
CREATE POLICY "Admins can read moderators" ON public.moderators FOR SELECT USING (true);

CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Create storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true);

-- Storage policies for materials bucket
CREATE POLICY "Anyone can read material files" ON storage.objects FOR SELECT USING (bucket_id = 'materials');
CREATE POLICY "Anyone can upload material files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materials');

-- Insert default data
INSERT INTO public.courses (name, code, description, color) VALUES
  ('مقدمة في علوم الحاسب', 'CS101', 'أساسيات الحوسبة والبرمجة', '190 80% 45%'),
  ('الجبر الخطي', 'MATH201', 'المتجهات والمصفوفات والتحويلات الخطية', '260 70% 55%'),
  ('اللغة الإنجليزية التقنية', 'ENG102', 'الكتابة الأكاديمية والتواصل التقني', '340 70% 55%'),
  ('فيزياء 1', 'PHY101', 'الميكانيكا والديناميكا الحرارية', '30 80% 50%');

INSERT INTO public.important_links (title, title_ar, url, is_persistent) VALUES
  ('Main E-Learning Website', 'موقع التعليم الإلكتروني الرئيسي', 'https://learn3.sha.edu.eg/', true);
