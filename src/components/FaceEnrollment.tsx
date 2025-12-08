import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFaceRecognition } from "@/hooks/useFaceRecognition";
import { useAuth } from "@/hooks/useAuth";
import { Camera, Check, Loader2, X, RefreshCw } from "lucide-react";

interface FaceEnrollmentProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const FaceEnrollment = ({ onComplete, onCancel }: FaceEnrollmentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const {
    isModelLoaded,
    isLoading,
    isCameraActive,
    detectedFace,
    error,
    startCamera,
    stopCamera,
    enrollFace,
  } = useFaceRecognition();

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (isModelLoaded && videoRef.current && !isCameraActive) {
      startCamera(videoRef.current);
    }
  }, [isModelLoaded, isCameraActive, startCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleEnroll = async () => {
    if (!user) return;
    
    setIsEnrolling(true);
    const success = await enrollFace(user.id);
    setIsEnrolling(false);
    
    if (success) {
      setEnrolled(true);
      stopCamera();
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    }
  };

  const handleRetry = () => {
    if (videoRef.current) {
      startCamera(videoRef.current);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
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
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (enrolled) {
    return (
      <Card className="w-full max-w-md mx-auto border-confirm-green">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Check className="h-16 w-16 text-confirm-green mb-4" />
          <p className="text-xl font-semibold text-confirm-green">Face Enrolled Successfully!</p>
          <p className="text-muted-foreground mt-2">You can now use face login for emergencies.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Face Enrollment
        </CardTitle>
        <CardDescription>
          Position your face in the camera to enable emergency face login.
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
            detectedFace ? "border-confirm-green" : "border-transparent"
          }`} />
          
          {/* Status indicator */}
          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium ${
            detectedFace 
              ? "bg-confirm-green text-white" 
              : "bg-background/80 text-muted-foreground"
          }`}>
            {detectedFace ? "Face Detected" : "No Face Detected"}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleEnroll}
            disabled={!detectedFace || isEnrolling}
            className="flex-1"
            size="lg"
          >
            {isEnrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Enroll Face
              </>
            )}
          </Button>
          
          {onCancel && (
            <Button
              onClick={() => {
                stopCamera();
                onCancel();
              }}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Your face data is stored securely and used only for emergency login.
        </p>
      </CardContent>
    </Card>
  );
};
