-- Create notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id text PRIMARY KEY,
    title_template text NOT NULL,
    message_template text NOT NULL,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for edge functions or clients to read templates)
CREATE POLICY "Allow public read access on notification_templates" 
ON public.notification_templates FOR SELECT 
USING (true);

-- Allow owner write access
CREATE POLICY "Allow owner to update notification_templates" 
ON public.notification_templates FOR ALL 
USING (true)
WITH CHECK (true);

-- Insert default templates
INSERT INTO public.notification_templates (id, title_template, message_template) VALUES 
('material_upload', 'تم رفع {type}: {title}', 'في مقرر {courseName}'),
('bulk_upload', 'تم رفع {count} {type} جديدة', 'في مقرر {courseName}'),
('assignment_deadline', 'تم رفع تكليف: {title}', 'موعد التسليم: {deadline}'),
('assignment_open', 'تم رفع تكليف: {title}', 'بدون موعد نهائي')
ON CONFLICT (id) DO NOTHING;
