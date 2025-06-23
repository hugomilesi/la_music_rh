
-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'válido' CHECK (status IN ('válido', 'vencido', 'vencendo', 'pendente')),
  notes TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false, 
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents table
CREATE POLICY "Allow authenticated users to view documents" ON public.documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert documents" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update documents" ON public.documents
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete documents" ON public.documents
  FOR DELETE TO authenticated USING (true);

-- Create storage policies for documents bucket
CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to view documents" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to update documents" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to delete documents" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents');

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check document expiry status
CREATE OR REPLACE FUNCTION public.check_document_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date IS NOT NULL THEN
    IF NEW.expiry_date < CURRENT_DATE THEN
      NEW.status = 'vencido';
    ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
      NEW.status = 'vencendo';
    ELSE
      NEW.status = 'válido';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update document status based on expiry date
CREATE TRIGGER update_document_status
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.check_document_status();
