import { useState } from "react";
import { Plus, Play, Pencil, Trash2, Volume2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useCustomPhrases } from "@/hooks/useCustomPhrases";
import { useSpeech } from "@/hooks/useSpeech";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CustomMessages = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { phrases, loading, deletePhrase } = useCustomPhrases();
  const { speakOnce, isSpeaking, stop } = useSpeech({ loop: false });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handlePlay = (phraseText: string) => {
    if (isSpeaking) {
      stop();
    }
    speakOnce(phraseText);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deletePhrase(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <Layout>
      <div className="container px-4 py-6 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">My Phrases</h2>
          <Button onClick={() => navigate("/create-message")} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : phrases.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <Volume2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-foreground">No custom phrases yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your own phrases to quickly communicate your needs.
            </p>
            <Button onClick={() => navigate("/create-message")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Phrase
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {phrases.map((phrase) => (
              <Card key={phrase.id} className="flex items-center gap-3 p-4">
                <button
                  onClick={() => handlePlay(phrase.phrase_text)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
                  aria-label={`Play: ${phrase.label}`}
                >
                  <Play className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{phrase.label}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {phrase.phrase_text}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/create-message?edit=${phrase.id}`)}
                    aria-label="Edit phrase"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(phrase.id)}
                    aria-label="Delete phrase"
                  >
                    <Trash2 className="h-4 w-4 text-emergency" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Phrase?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The phrase will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-emergency hover:bg-emergency/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default CustomMessages;
