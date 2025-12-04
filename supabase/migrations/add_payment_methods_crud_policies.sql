-- Add RLS policies for payment_methods CRUD operations
-- This allows authenticated users to perform all operations on payment methods

-- Policy for INSERT
CREATE POLICY "Enable insert for all users" ON payment_methods
FOR INSERT
WITH CHECK (true);

-- Policy for UPDATE
CREATE POLICY "Enable update for all users" ON payment_methods
FOR UPDATE
USING (true);

-- Policy for DELETE
CREATE POLICY "Enable delete for all users" ON payment_methods
FOR DELETE
USING (true);
