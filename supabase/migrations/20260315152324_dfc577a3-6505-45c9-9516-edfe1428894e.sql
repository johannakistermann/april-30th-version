
-- Allow authenticated users to see practitioner roles (needed for browse)
CREATE POLICY "Anyone can see practitioner roles"
ON public.user_roles FOR SELECT TO authenticated
USING (role = 'practitioner');
