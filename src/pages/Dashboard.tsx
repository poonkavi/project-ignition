import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useSpeech } from "@/hooks/useSpeech";
import { supabase } from "@/integrations/supabase/client";
import QuickActionsGrid from "@/components/communication/QuickActionsGrid";
import StopButton from "@/components/communication/StopButton";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [patientName, setPatientName] = useState<string>("Patient");
  const [medicalCondition, setMedicalCondition] = useState<string | null>(null);

  const { speak, stop, isSpeaking, currentText, isSupported } = useSpeech({
    volume: 1,
    rate: 0.9,
    loop: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("name, medical_condition")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data?.name) {
          setPatientName(data.name);
        }
        if (data?.medical_condition) {
          setMedicalCondition(data.medical_condition);
        }
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!isSupported) {
      toast.error("Text-to-speech is not supported in your browser");
    }
  }, [isSupported]);

  const handleSpeak = (phrase: string) => {
    if (!isSupported) {
      toast.error("Text-to-speech is not available");
      return;
    }
    speak(phrase);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout patientName={patientName}>
      <div className="container px-4 py-6 pb-24">
        {/* Patient Status */}
        <div className="mb-6 rounded-xl bg-card p-4 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Hello, {patientName}
              </h2>
              {medicalCondition && (
                <p className="text-sm text-muted-foreground">
                  Condition: {medicalCondition}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <Volume2 className="h-5 w-5 text-primary animate-pulse" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Header */}
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Tap to Speak
        </h3>

        {/* TTS Support Warning */}
        {!isSupported && (
          <div className="mb-4 rounded-lg bg-warning/10 border border-warning p-3">
            <p className="text-sm text-warning">
              Text-to-speech is not supported in your browser. Please try a
              different browser.
            </p>
          </div>
        )}

        {/* Quick Actions Grid */}
        <QuickActionsGrid onSpeak={handleSpeak} currentPhrase={currentText} />

        {/* Instructions */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Tap any button to speak. Audio will repeat until you press STOP.
        </p>
      </div>

      {/* Stop Button Overlay */}
      <StopButton
        onClick={stop}
        isVisible={isSpeaking}
        currentPhrase={currentText}
      />
    </Layout>
  );
};

export default Dashboard;
