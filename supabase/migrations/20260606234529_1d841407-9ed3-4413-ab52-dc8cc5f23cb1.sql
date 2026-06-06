
CREATE TABLE IF NOT EXISTS public.assignment_reminders_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('24h','6h','1h')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (material_id, reminder_type)
);

GRANT SELECT, INSERT ON public.assignment_reminders_sent TO authenticated;
GRANT ALL ON public.assignment_reminders_sent TO service_role;

ALTER TABLE public.assignment_reminders_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access" ON public.assignment_reminders_sent
  FOR ALL TO service_role USING (true) WITH CHECK (true);
