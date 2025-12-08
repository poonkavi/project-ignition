import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFaceRecognition } from "@/hooks/useFaceRecognition";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Camera, Loader2, X, RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react";

interface FaceLoginProps {
  onBack?: () => void;
  isEmergency?: boolean;
}

export const FaceLogin = ({ onBack, isEmergency = false }: FaceLoginProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const {
    isModelLoaded,
    isLoading,
    isCameraActive,
    detectedFace,
    error,
    startCamera,
    stopCamera,
    recognizeFace,
  } = useFaceRecognition();

  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionAttempts, setRecognitionAttempts] = useState(0);
  const recognitionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const attemptRecognition = useCallback(async () => {
    if (isRecognizing) return;
    
    setIsRecognizing(true);
    const result = await recognizeFace();
    
    if (result) {
      // Face recognized - sign in the user
      stopCamera();
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
      }
      
      toast.success(`Welcome back, ${result.name}!`);
      
      // For emergency mode, navigate directly to dashboard
      // Note: This requires the user to already have an active session or
      // implementing a special emergency token system
      if (isEmergency) {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      setRecognitionAttempts((prev) => prev + 1);
      setIsRecognizing(false);
    }
  }, [isRecognizing, recognizeFace, stopCamera, navigate, isEmergency]);

  useEffect(() => {
    if (isModelLoaded && videoRef.current && !isCameraActive) {
      startCamera(videoRef.current);
    }
  }, [isModelLoaded, isCameraActive, startCamera]);

  // Auto-recognition when face is detected
  useEffect(() => {
    if (isCameraActive && detectedFace && !isRecognizing) {
      // Attempt recognition when face is detected
      if (!recognitionIntervalRef.current) {
        recognitionIntervalRef.current = setInterval(() => {
          attemptRecognition();
        }, 1500); // Try every 1.5 seconds
      }
    } else if (!detectedFace && recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }

    return () => {
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
      }
    };
  }, [isCameraActive, detectedFace, isRecognizing, attemptRecognition]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
      }
    };
  }, [stopCamera]);

  const handleRetry = () => {
    setRecognitionAttempts(0);
    if (videoRef.current) {
      startCamera(videoRef.current);
    }
  };

  if (isLoading) {
    return (
      <Card className={`w-full max-w-md mx-auto ${isEmergency ? "border-emergency-red" : ""}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading face recognition...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto border-destructive">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <X className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive text-center mb-4">{error}</p>
          <div className="flex gap-3">
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${isEmergency ? "border-emergency-red border-2" : ""}`}>
      <CardHeader className={isEmergency ? "bg-emergency-red/10" : ""}>
        <CardTitle className={`flex items-center gap-2 ${isEmergency ? "text-emergency-red" : ""}`}>
          {isEmergency ? (
            <>
              <AlertTriangle className="h-5 w-5" />
              Emergency Face Login
            </>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              Face Login
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isEmergency 
            ? "Look at the camera for emergency access"
            : "Position your face in the camera to log in"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Face detection overlay */}
          <div className={`absolute inset-0 border-4 rounded-lg transition-colors ${
            detectedFace 
              ? isEmergency 
                ? "border-emergency-red animate-pulse" 
                : "border-confirm-green"
              : "border-transparent"
          }`} />
          
          {/* Status indicator */}
          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium ${
            isRecognizing
              ? "bg-primary text-primary-foreground"
              : detectedFace 
                ? isEmergency
                  ? "bg-emergency-red text-white"
                  : "bg-confirm-green text-white"
                : "bg-background/80 text-muted-foreground"
          }`}>
            {isRecognizing 
              ? "Recognizing..." 
              : detectedFace 
                ? "Face Detected - Matching..." 
                : "Looking for face..."
            }
          </div>
        </div>

        {recognitionAttempts >= 3 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Face not recognized. Try adjusting lighting or use password login.
            </p>
          </div>
        )}

        {onBack && (
          <Button
            onClick={() => {
              stopCamera();
              onBack();
            }}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Password Login
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
