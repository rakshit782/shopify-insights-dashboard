-- Create a table for public user profiles
CREATE TABLE profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_name text,
  last_name text,
  updated_at timestamp with time zone,
  
  PRIMARY KEY (id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to everyone
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- This trigger automatically creates a profile entry when a new user signs up
-- and copies the first_name and last_name from the user_metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Link the trigger to the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Set up Storage!
-- Although not used in the current code, this is standard practice for user avatars.
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true);

-- CREATE POLICY "Avatar images are publicly accessible."
--   ON storage.objects FOR SELECT
--   USING ( bucket_id = 'avatars' );

-- CREATE POLICY "Anyone can upload an avatar."
--   ON storage.objects FOR INSERT
--   WITH CHECK ( bucket_id = 'avatars' );

-- CREATE POLICY "Anyone can update their own avatar."
--   ON storage.objects FOR UPDATE
--   USING ( auth.uid() = owner )
--   WITH CHECK ( bucket_id = 'avatars' );
