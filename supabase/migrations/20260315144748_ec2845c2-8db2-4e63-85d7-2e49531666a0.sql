
-- Add 'referral' to message_channel enum
ALTER TYPE public.message_channel ADD VALUE IF NOT EXISTS 'referral';

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general',
  added_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS policies for products (public access since no auth yet)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE TO anon, authenticated USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for products
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- Insert some initial stock products
INSERT INTO public.products (name, price, quantity, category, added_by) VALUES
  ('Furça dentare', 2.50, 3, 'supplies', 'system'),
  ('Doreza lateks M', 8.00, 5, 'supplies', 'system'),
  ('Anestezik lokal', 15.00, 2, 'supplies', 'system'),
  ('Maska N95', 12.00, 4, 'supplies', 'system'),
  ('Pasta zbardhëse', 25.00, 20, 'cosmetic', 'system'),
  ('Material mbushës', 35.00, 15, 'restorative', 'system'),
  ('Fije dentare', 3.50, 50, 'supplies', 'system'),
  ('Dezinfektant sipërfaqesh', 18.00, 8, 'cleaning', 'system'),
  ('Kapsulë fluoruri', 22.00, 30, 'preventive', 'system'),
  ('Kit implanti', 450.00, 6, 'surgery', 'system');
