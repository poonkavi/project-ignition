import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  medical_condition: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } else {
      setProfile(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (
    updates: Partial<Pick<Profile, "name" | "age" | "medical_condition">>
  ) => {
    if (!user || !profile) return null;

    // Validate name
    if (updates.name !== undefined && !updates.name.trim()) {
      toast.error("Name is required");
      return null;
    }

    // Optimistic update
    const previousProfile = profile;
    const optimisticProfile = { ...profile, ...updates };
    setProfile(optimisticProfile);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        name: updates.name?.trim(),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      // Rollback on error
      setProfile(previousProfile);
      toast.error("Failed to update profile");
      console.error(error);
      return null;
    }

    setProfile(data);
    toast.success("Profile updated");
    return data;
  };

  return {
    profile,
    loading,
    updateProfile,
    refreshProfile: fetchProfile,
  };
};
