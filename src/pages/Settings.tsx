import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, Volume2, Gauge } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useSpeech } from "@/hooks/useSpeech";

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const { availableVoices, speakOnce } = useSpeech({ loop: false });

  const [volume, setVolume] = useState(1);
  const [speechRate, setSpeechRate] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (settings) {
      setVolume(settings.volume);
      setSpeechRate(settings.speech_rate);
      setSelectedVoice(settings.preferred_voice || "");
    }
  }, [settings]);

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    await updateSettings({ volume: newVolume });
  };

  const handleSpeechRateChange = async (value: number[]) => {
    const newRate = value[0];
    setSpeechRate(newRate);
    await updateSettings({ speech_rate: newRate });
  };

  const handleVoiceChange = async (value: string) => {
    setSelectedVoice(value);
    await updateSettings({ preferred_voice: value || null });
  };

  const handleTestVoice = () => {
    speakOnce("Hello, this is a test of your voice settings.");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Filter to get unique voices
  const uniqueVoices = availableVoices.filter(
    (voice, index, self) => self.findIndex((v) => v.name === voice.name) === index
  );

  return (
    <Layout>
      <div className="container px-4 py-6 pb-24">
        <h2 className="mb-6 text-xl font-semibold text-foreground">Settings</h2>

        <div className="space-y-6">
          {/* Audio Settings */}
          <Card className="p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <Volume2 className="h-5 w-5 text-primary" />
              Audio Settings
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Volume</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Speech Speed</Label>
                  <span className="text-sm text-muted-foreground">
                    {speechRate.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  value={[speechRate]}
                  onValueChange={handleSpeechRateChange}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Default voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default</SelectItem>
                    {uniqueVoices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={handleTestVoice} className="w-full">
                Test Voice
              </Button>
            </div>
          </Card>

          {/* App Info */}
          <Card className="p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <Gauge className="h-5 w-5 text-primary" />
              About
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>My Voice Dictionary</strong>
              </p>
              <p>Version 1.0.0</p>
              <p>A communication aid for patients with speech difficulties.</p>
            </div>
          </Card>

          {/* Sign Out */}
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full border-emergency text-emergency hover:bg-emergency hover:text-emergency-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
