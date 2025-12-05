import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "patient" | "caregiver" | "family_member";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setRole("patient"); // Default fallback
      } else {
        setRole(data?.role as AppRole || "patient");
      }
      
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const hasRole = (checkRole: AppRole): boolean => {
    return role === checkRole;
  };

  const isPatient = role === "patient";
  const isCaregiver = role === "caregiver";
  const isFamilyMember = role === "family_member";

  return {
    role,
    loading,
    hasRole,
    isPatient,
    isCaregiver,
    isFamilyMember,
  };
};
