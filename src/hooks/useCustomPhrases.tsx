import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CustomPhrase {
  id: string;
  user_id: string;
  phrase_text: string;
  label: string;
  language: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export const useCustomPhrases = () => {
  const { user } = useAuth();
  const [phrases, setPhrases] = useState<CustomPhrase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhrases = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("custom_phrases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load phrases");
      console.error(error);
    } else {
      setPhrases(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPhrases();
  }, [fetchPhrases]);

  const createPhrase = async (label: string, phraseText: string, language = "en", category?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("custom_phrases")
      .insert({
        user_id: user.id,
        label,
        phrase_text: phraseText,
        language,
        category,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create phrase");
      console.error(error);
      return null;
    }

    setPhrases((prev) => [data, ...prev]);
    toast.success("Phrase created");
    return data;
  };

  const updatePhrase = async (id: string, updates: Partial<Pick<CustomPhrase, "label" | "phrase_text" | "language" | "category">>) => {
    const { data, error } = await supabase
      .from("custom_phrases")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      toast.error("Failed to update phrase");
      console.error(error);
      return null;
    }

    setPhrases((prev) => prev.map((p) => (p.id === id ? data : p)));
    toast.success("Phrase updated");
    return data;
  };

  const deletePhrase = async (id: string) => {
    const { error } = await supabase
      .from("custom_phrases")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete phrase");
      console.error(error);
      return false;
    }

    setPhrases((prev) => prev.filter((p) => p.id !== id));
    toast.success("Phrase deleted");
    return true;
  };

  return {
    phrases,
    loading,
    createPhrase,
    updatePhrase,
    deletePhrase,
    refreshPhrases: fetchPhrases,
  };
};
