-- Create enum types for channels and lead statuses
CREATE TYPE public.message_channel AS ENUM ('whatsapp', 'facebook', 'instagram', 'email');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'consulting', 'waiting', 'converted', 'lost');

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  channel message_channel NOT NULL,
  status lead_status NOT NULL DEFAULT 'new',
  assigned_to TEXT,
  first_contact TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message TEXT,
  notes TEXT,
  converted_patient_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL,
  channel message_channel NOT NULL,
  external_id TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_channel ON public.leads(channel);
CREATE INDEX idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX idx_messages_lead_id ON public.messages(lead_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp);
CREATE INDEX idx_messages_external_id ON public.messages(external_id);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Staff access policies
CREATE POLICY "Staff can view all leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can create leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update leads" ON public.leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Staff can delete leads" ON public.leads FOR DELETE TO authenticated USING (true);

CREATE POLICY "Staff can view all messages" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can create messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update messages" ON public.messages FOR UPDATE TO authenticated USING (true);

-- Allow anon role for webhook inserts (edge functions with verify_jwt=false)
CREATE POLICY "Anon can insert leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert messages" ON public.messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update leads" ON public.leads FOR UPDATE TO anon USING (true);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();