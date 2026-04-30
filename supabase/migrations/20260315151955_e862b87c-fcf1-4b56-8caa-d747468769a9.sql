
-- Add bio and avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add status and ended_at to practitioner_clients
ALTER TABLE public.practitioner_clients ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE public.practitioner_clients ADD COLUMN IF NOT EXISTS ended_at timestamptz;

-- Add expires_at to client_invitations
ALTER TABLE public.client_invitations ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '7 days');

-- Unique partial index: one active practitioner per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_practitioner_per_client
ON public.practitioner_clients (client_id)
WHERE status = 'active';

-- RLS: Allow authenticated users to read practitioner profiles (for browse)
CREATE POLICY "Anyone can view practitioner profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  public.has_role(user_id, 'practitioner'::app_role)
  OR auth.uid() = user_id
);

-- RLS: Practitioner can update own practitioner_clients (for disconnect)
CREATE POLICY "Practitioners can update own client connections"
ON public.practitioner_clients FOR UPDATE TO authenticated
USING (auth.uid() = practitioner_id)
WITH CHECK (auth.uid() = practitioner_id);

-- RLS: Client can update own practitioner_clients (for disconnect)
CREATE POLICY "Clients can update own practitioner connections"
ON public.practitioner_clients FOR UPDATE TO authenticated
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- RLS: Allow insert into practitioner_clients (for direct connect from browse)
CREATE POLICY "Authenticated users can create connections"
ON public.practitioner_clients FOR INSERT TO authenticated
WITH CHECK (auth.uid() = client_id);
