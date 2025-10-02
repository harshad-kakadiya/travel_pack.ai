-- Insert sample affiliate links into affiliate_links table
INSERT INTO affiliate_links (slug, url, label, created_at, clicks) VALUES
('booking-com', 'https://www.booking.com/?aid=123456', 'Find Hotels & Accommodations', NOW(), 0),
('skyscanner', 'https://www.skyscanner.com/?associateid=travelpack', 'Compare Flight Prices', NOW(), 0),
('airbnb', 'https://www.airbnb.com/c/travelpack?currency=USD', 'Book Unique Stays', NOW(), 0),
('getyourguide', 'https://www.getyourguide.com/?partner_id=travelpack', 'Book Tours & Activities', NOW(), 0);

-- Create a function to increment clicks
CREATE OR REPLACE FUNCTION increment_affiliate_clicks(link_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_links 
  SET clicks = clicks + 1 
  WHERE slug = link_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_affiliate_clicks(TEXT) TO authenticated;