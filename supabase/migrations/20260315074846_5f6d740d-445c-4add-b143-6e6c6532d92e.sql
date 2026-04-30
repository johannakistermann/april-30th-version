
CREATE TYPE public.app_role AS ENUM ('admin', 'practitioner', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can self-assign practitioner" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'practitioner');

CREATE TABLE public.client_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can view own invitations" ON public.client_invitations
  FOR SELECT TO authenticated USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can insert invitations" ON public.client_invitations
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = practitioner_id AND public.has_role(auth.uid(), 'practitioner')
  );

CREATE TABLE public.practitioner_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitation_id uuid REFERENCES public.client_invitations(id),
  connected_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (practitioner_id, client_id)
);

ALTER TABLE public.practitioner_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can view own clients" ON public.practitioner_clients
  FOR SELECT TO authenticated USING (auth.uid() = practitioner_id);

CREATE POLICY "Clients can view own practitioners" ON public.practitioner_clients
  FOR SELECT TO authenticated USING (auth.uid() = client_id);
