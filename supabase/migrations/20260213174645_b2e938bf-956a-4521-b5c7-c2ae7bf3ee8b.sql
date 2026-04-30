
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  interaction_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Rewards table
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone INT NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'claimable' CHECK (status IN ('claimable', 'claimed')),
  discount_code TEXT,
  amount_usd NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed_at TIMESTAMPTZ
);
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards" ON public.rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can claim own rewards" ON public.rewards FOR UPDATE USING (auth.uid() = user_id AND status = 'claimable');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment interaction count and check milestone
CREATE OR REPLACE FUNCTION public.increment_interaction(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  new_count INT;
  reward_exists BOOLEAN;
  result JSON;
BEGIN
  UPDATE public.profiles 
  SET interaction_count = interaction_count + 1, updated_at = now()
  WHERE user_id = p_user_id
  RETURNING interaction_count INTO new_count;
  
  IF new_count IS NULL THEN
    RETURN json_build_object('count', 0, 'reward', false);
  END IF;
  
  -- Check if we hit 30 and no reward exists yet
  IF new_count >= 30 THEN
    SELECT EXISTS(SELECT 1 FROM public.rewards WHERE user_id = p_user_id) INTO reward_exists;
    IF NOT reward_exists THEN
      INSERT INTO public.rewards (user_id, milestone, status, amount_usd)
      VALUES (p_user_id, 30, 'claimable', 5.00);
      RETURN json_build_object('count', new_count, 'reward', true, 'milestone_reached', true);
    END IF;
  END IF;
  
  RETURN json_build_object('count', new_count, 'reward', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
