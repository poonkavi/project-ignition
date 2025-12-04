import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, Save, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useCustomPhrases } from "@/hooks/useCustomPhrases";
import { useSpeech } from "@/hooks/useSpeech";
import { toast } from "sonner";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
];

const categories = [
  { value: "medical", label: "Medical" },
  { value: "comfort", label: "Comfort" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

const CreateMessage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const { user, loading: authLoading } = useAuth();
  const { phrases, createPhrase, updatePhrase } = useCustomPhrases();
  const { speakOnce, isSpeaking, stop } = useSpeech({ loop: false });

  const [label, setLabel] = useState("");
  const [phraseText, setPhraseText] = useState("");
  const [language, setLanguage] = useState("en");
  const [category, setCategory] = useState("other");
  const [saving, setSaving] = useState(false);

  const isEditing = !!editId;
  const maxChars = 200;

  useEffect(() => {
    if (editId && phrases.length > 0) {
      const phrase = phrases.find((p) => p.id === editId);
      if (phrase) {
        setLabel(phrase.label);
        setPhraseText(phrase.phrase_text);
        setLanguage(phrase.language || "en");
        setCategory(phrase.category || "other");
      }
    }
  }, [editId, phrases]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handlePreview = () => {
    if (!phraseText.trim()) {
      toast.error("Enter some text first");
      return;
    }
    if (isSpeaking) {
      stop();
    }
    speakOnce(phraseText);
  };

  const handleSave = async () => {
    if (!label.trim()) {
      toast.error("Please enter a label");
      return;
    }
    if (!phraseText.trim()) {
      toast.error("Please enter the phrase text");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updatePhrase(editId, { label, phrase_text: phraseText, language, category });
      } else {
        await createPhrase(label, phraseText, language, category);
      }
      navigate("/custom-messages");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container px-4 py-6 pb-24">
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/custom-messages")}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-foreground">
            {isEditing ? "Edit Phrase" : "Create Phrase"}
          </h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="label">Button Label</Label>
            <Input
              id="label"
              placeholder="e.g., Call Nurse"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Short name shown on the button
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phraseText">Phrase to Speak</Label>
            <Textarea
              id="phraseText"
              placeholder="e.g., Please call the nurse. I need assistance."
              value={phraseText}
              onChange={(e) => setPhraseText(e.target.value)}
              maxLength={maxChars}
              className="min-h-[120px]"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>What will be spoken aloud</span>
              <span>
                {phraseText.length}/{maxChars}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handlePreview}
              disabled={!phraseText.trim()}
            >
              <Play className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving || !label.trim() || !phraseText.trim()}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateMessage;
