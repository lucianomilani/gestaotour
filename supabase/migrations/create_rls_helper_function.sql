-- Create helper function to get the current user's company_id
-- This function will be used in all RLS policies

CREATE OR REPLACE FUNCTION auth.user_company_id()
RETURNS UUID AS $$
  SELECT company_id 
  FROM staff 
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION auth.user_company_id IS 'Returns the company_id of the currently authenticated user. Used in RLS policies for multi-tenant data isolation.';
