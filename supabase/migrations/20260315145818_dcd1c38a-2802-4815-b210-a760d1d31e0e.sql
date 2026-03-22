
-- Add anon SELECT policy for leads
CREATE POLICY "Anon can view leads"
ON public.leads FOR SELECT
TO anon
USING (true);

-- Add anon SELECT policy for messages
CREATE POLICY "Anon can view messages"
ON public.messages FOR SELECT
TO anon
USING (true);

-- Enable realtime for leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
