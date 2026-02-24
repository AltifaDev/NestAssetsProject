-- Create function to increment property views count
CREATE OR REPLACE FUNCTION increment_property_views(property_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE properties
    SET views_count = views_count + 1
    WHERE id = property_id;
END;
$$ LANGUAGE plpgsql;
