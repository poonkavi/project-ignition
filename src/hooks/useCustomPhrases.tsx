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

  // Real-time subscription for live updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('custom-phrases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_phrases',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newPhrase = payload.new as CustomPhrase;
            setPhrases((prev) => {
              // Avoid duplicates from optimistic updates
              if (prev.some((p) => p.id === newPhrase.id)) return prev;
              return [newPhrase, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedPhrase = payload.new as CustomPhrase;
            setPhrases((prev) =>
              prev.map((p) => (p.id === updatedPhrase.id ? updatedPhrase : p))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setPhrases((prev) => prev.filter((p) => p.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createPhrase = async (label: string, phraseText: string, language = "en", category?: string) => {
    if (!user) return null;

    // Validate inputs
    if (!label.trim() || !phraseText.trim()) {
      toast.error("Label and phrase text are required");
      return null;
    }

    // Optimistic update with temp ID
    const tempId = `temp-${Date.now()}`;
    const optimisticPhrase: CustomPhrase = {
      id: tempId,
      user_id: user.id,
      label: label.trim(),
      phrase_text: phraseText.trim(),
      language,
      category: category || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPhrases((prev) => [optimisticPhrase, ...prev]);

    const { data, error } = await supabase
      .from("custom_phrases")
      .insert({
        user_id: user.id,
        label: label.trim(),
        phrase_text: phraseText.trim(),
        language,
        category,
      })
      .select()
      .single();

    if (error) {
      // Rollback optimistic update
      setPhrases((prev) => prev.filter((p) => p.id !== tempId));
      toast.error("Failed to create phrase");
      console.error(error);
      return null;
    }

    // Replace temp with real data
    setPhrases((prev) => prev.map((p) => (p.id === tempId ? data : p)));
    toast.success("Phrase created");
    return data;
  };

  const updatePhrase = async (id: string, updates: Partial<Pick<CustomPhrase, "label" | "phrase_text" | "language" | "category">>) => {
    // Optimistic update
    const previousPhrases = phrases;
    setPhrases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );

    const { data, error } = await supabase
      .from("custom_phrases")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // Rollback on error
      setPhrases(previousPhrases);
      toast.error("Failed to update phrase");
      console.error(error);
      return null;
    }

    setPhrases((prev) => prev.map((p) => (p.id === id ? data : p)));
    toast.success("Phrase updated");
    return data;
  };

  const deletePhrase = async (id: string) => {
    // Optimistic delete
    const previousPhrases = phrases;
    setPhrases((prev) => prev.filter((p) => p.id !== id));

    const { error } = await supabase
      .from("custom_phrases")
      .delete()
      .eq("id", id);

    if (error) {
      // Rollback on error
      setPhrases(previousPhrases);
      toast.error("Failed to delete phrase");
      console.error(error);
      return false;
    }

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
