
-- Integration configurations table
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE,
  display_name text NOT NULL,
  is_connected boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  connected_account text,
  connected_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Policies - only authenticated staff can manage integrations
CREATE POLICY "Staff can view integrations" ON public.integrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can update integrations" ON public.integrations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Staff can insert integrations" ON public.integrations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can delete integrations" ON public.integrations FOR DELETE TO authenticated USING (true);

-- Also allow anon for now (no auth implemented yet)
CREATE POLICY "Anon can view integrations" ON public.integrations FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can manage integrations" ON public.integrations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update integrations" ON public.integrations FOR UPDATE TO anon USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default platforms
INSERT INTO public.integrations (platform, display_name) VALUES
  ('whatsapp', 'WhatsApp Business'),
  ('facebook', 'Facebook Messenger'),
  ('instagram', 'Instagram DM'),
  ('email', 'Email (SMTP)'),
  ('google_calendar', 'Google Calendar');
