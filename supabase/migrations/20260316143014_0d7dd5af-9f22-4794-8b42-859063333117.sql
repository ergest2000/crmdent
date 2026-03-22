
-- Create storage bucket for patient attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-attachments', 'patient-attachments', true);

-- Allow anyone to upload to patient-attachments bucket
CREATE POLICY "Anyone can upload patient attachments"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'patient-attachments');

-- Allow anyone to view patient attachments
CREATE POLICY "Anyone can view patient attachments"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'patient-attachments');

-- Allow anyone to delete patient attachments
CREATE POLICY "Anyone can delete patient attachments"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'patient-attachments');
