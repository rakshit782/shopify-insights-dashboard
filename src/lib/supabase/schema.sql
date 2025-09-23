-- 1. Create the 'profiles' table
-- This table will store public profile information about users.
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  updated_at timestamp with time zone NULL,
  first_name text NULL,
  last_name text NULL,
  business_name text NULL,
  business_logo_url text NULL,
  business_address text NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Enable Row Level Security (RLS)
-- This ensures that users can only access their own data.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- Policy for users to view their own profile.
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

-- Policy for users to insert their own profile.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy for users to update their own profile.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Create a trigger to automatically create a profile when a new user signs up.
-- This function will be called by the trigger.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- The trigger that calls the function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Set up Storage for business logos (optional, but good for business_logo_url)
-- Create a new bucket for business logos with public access.
INSERT INTO storage.buckets (id, name, public)
VALUES ('business_logos', 'business_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create a policy that allows authenticated users to upload to the 'business_logos' bucket.
CREATE POLICY "Authenticated users can upload logos."
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business_logos');

-- Create a policy that allows anyone to view logos.
CREATE POLICY "Anyone can view logos."
ON storage.objects FOR SELECT
USING (bucket_id = 'business_logos');
