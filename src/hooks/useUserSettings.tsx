import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserSettings {
  id: string;
  user_id: string;
  volume: number;
  speech_rate: number;
  preferred_voice: string | null;
  language: string;
  theme: string;
}

const defaultSettings: Omit<UserSettings, "id" | "user_id"> = {
  volume: 1.0,
  speech_rate: 1.0,
  preferred_voice: null,
  language: "en",
  theme: "light",
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch settings:", error);
    } else if (data) {
      setSettings(data);
    } else {
      // Create default settings if none exist
      const { data: newSettings, error: insertError } = await supabase
        .from("user_settings")
        .insert({ user_id: user.id, ...defaultSettings })
        .select()
        .single();

      if (!insertError && newSettings) {
        setSettings(newSettings);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates: Partial<Omit<UserSettings, "id" | "user_id">>) => {
    if (!user || !settings) return null;

    // Optimistic update
    const previousSettings = settings;
    setSettings({ ...settings, ...updates });

    const { data, error } = await supabase
      .from("user_settings")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      // Rollback on error
      setSettings(previousSettings);
      console.error("Failed to update settings:", error);
      return null;
    }

    setSettings(data);
    return data;
  };

  return {
    settings: settings || { ...defaultSettings, id: "", user_id: "" } as UserSettings,
    loading,
    updateSettings,
    refreshSettings: fetchSettings,
  };
};
