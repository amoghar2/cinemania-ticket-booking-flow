
-- Enable public read access to seats (since seat availability should be visible to all users)
CREATE POLICY "Anyone can view seats" 
  ON public.seats 
  FOR SELECT 
  USING (true);

-- Allow seat creation for shows (needed for the createSeatsForShow function)
CREATE POLICY "Allow seat creation for shows" 
  ON public.seats 
  FOR INSERT 
  WITH CHECK (true);

-- Allow seat updates (for booking/locking seats)
CREATE POLICY "Allow seat updates" 
  ON public.seats 
  FOR UPDATE 
  USING (true);
