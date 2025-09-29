/*
  # Create affiliate products table

  1. New Tables
    - `affiliate_products`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `affiliate_url` (text, not null)
      - `image_url` (text, not null)
      - `price` (text, not null)
      - `category` (text, not null)
      - `is_active` (boolean, default true)
      - `sort_order` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `affiliate_products` table
    - Add policy for public read access to active products
    - Add policy for authenticated users to manage products (admin use)

  3. Sample Data
    - Insert sample affiliate products for travel essentials
*/

CREATE TABLE IF NOT EXISTS affiliate_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  affiliate_url text NOT NULL,
  image_url text NOT NULL,
  price text NOT NULL,
  category text NOT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products
CREATE POLICY "Public can read active affiliate products"
  ON affiliate_products
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow authenticated users to manage products (for admin use)
CREATE POLICY "Authenticated users can manage affiliate products"
  ON affiliate_products
  FOR ALL
  TO authenticated
  USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_products_active_sort 
  ON affiliate_products (is_active, sort_order, created_at);

-- Insert sample data
INSERT INTO affiliate_products (title, description, affiliate_url, image_url, price, category, sort_order) VALUES
('Universal Travel Adapter', 'Works in 190+ countries with USB-C fast charging', 'https://example.com/adapter', 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=150', 'from $24', 'Electronics', 1),
('Packable Travel Backpack', 'Lightweight, waterproof, perfect for day trips', 'https://example.com/backpack', 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=150', 'from $45', 'Luggage', 2),
('Noise-Canceling Earbuds', 'Perfect for flights and busy environments', 'https://example.com/earbuds', 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=150', 'from $89', 'Electronics', 3),
('Portable Phone Charger', 'Fast-charging power bank for all devices', 'https://example.com/charger', 'https://images.pexels.com/photos/4194842/pexels-photo-4194842.jpeg?auto=compress&cs=tinysrgb&w=150', 'from $32', 'Electronics', 4),
('Travel Insurance', 'Comprehensive coverage for peace of mind', 'https://example.com/insurance', 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=150', 'from $15', 'Insurance', 5),
('Packing Cubes Set', 'Organize your luggage like a pro', 'https://example.com/packing-cubes', 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=150', 'from $28', 'Luggage', 6);