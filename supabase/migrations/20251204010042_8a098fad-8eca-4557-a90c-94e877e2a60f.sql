-- Create custom_phrases table
CREATE TABLE public.custom_phrases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phrase_text TEXT NOT NULL,
  label VARCHAR(100) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_phrases ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own phrases"
ON public.custom_phrases
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own phrases"
ON public.custom_phrases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phrases"
ON public.custom_phrases
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phrases"
ON public.custom_phrases
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_custom_phrases_updated_at
BEFORE UPDATE ON public.custom_phrases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_settings table for preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  volume DECIMAL(3,2) DEFAULT 1.0,
  speech_rate DECIMAL(3,2) DEFAULT 1.0,
  preferred_voice VARCHAR(100),
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'light',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id);