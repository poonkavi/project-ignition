-- Add face_descriptor column to profiles table for storing face recognition data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS face_descriptor jsonb NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.face_descriptor IS 'Stores face recognition descriptor (128-dimension vector) for emergency face login';