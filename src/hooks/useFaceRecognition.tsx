import { useState, useEffect, useCallback, useRef } from "react";
import * as faceapi from "face-api.js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MODEL_URL = "/models";
const MATCH_THRESHOLD = 0.6;

export interface FaceRecognitionState {
  isModelLoaded: boolean;
  isLoading: boolean;
  isCameraActive: boolean;
  detectedFace: boolean;
  error: string | null;
}

export const useFaceRecognition = () => {
  const [state, setState] = useState<FaceRecognitionState>({
    isModelLoaded: false,
    isLoading: true,
    isCameraActive: false,
    detectedFace: false,
    error: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load face-api models
  const loadModels = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      setState((prev) => ({ ...prev, isModelLoaded: true, isLoading: false }));
    } catch (error) {
      console.error("Failed to load face recognition models:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load face recognition models. Please refresh and try again.",
      }));
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      videoRef.current = videoElement;
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      
      streamRef.current = stream;
      videoElement.srcObject = stream;
      
      setState((prev) => ({ ...prev, isCameraActive: true, error: null }));
    } catch (error) {
      console.error("Failed to start camera:", error);
      setState((prev) => ({
        ...prev,
        error: "Camera access denied. Please allow camera access for face recognition.",
      }));
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState((prev) => ({ ...prev, isCameraActive: false, detectedFace: false }));
  }, []);

  // Detect face in video
  const detectFace = useCallback(async (): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>> | null> => {
    if (!videoRef.current || !state.isModelLoaded) return null;

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    setState((prev) => ({ ...prev, detectedFace: !!detection }));
    return detection || null;
  }, [state.isModelLoaded]);

  // Enroll face for a user
  const enrollFace = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const detection = await detectFace();
      
      if (!detection) {
        toast.error("No face detected. Please position your face in the camera.");
        return false;
      }

      const descriptor = Array.from(detection.descriptor);

      const { error } = await supabase
        .from("profiles")
        .update({ face_descriptor: descriptor })
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to save face descriptor:", error);
        toast.error("Failed to save face data. Please try again.");
        return false;
      }

      toast.success("Face enrolled successfully!");
      return true;
    } catch (error) {
      console.error("Face enrollment error:", error);
      toast.error("Face enrollment failed. Please try again.");
      return false;
    }
  }, [detectFace]);

  // Recognize face and return matching user
  const recognizeFace = useCallback(async (): Promise<{ userId: string; name: string } | null> => {
    try {
      const detection = await detectFace();
      
      if (!detection) {
        return null;
      }

      // Fetch all profiles with face descriptors
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, name, face_descriptor")
        .not("face_descriptor", "is", null);

      if (error || !profiles?.length) {
        return null;
      }

      // Compare with stored face descriptors
      const inputDescriptor = detection.descriptor;
      
      for (const profile of profiles) {
        if (!profile.face_descriptor) continue;
        
        const storedDescriptor = new Float32Array(profile.face_descriptor as number[]);
        const distance = faceapi.euclideanDistance(inputDescriptor, storedDescriptor);
        
        if (distance < MATCH_THRESHOLD) {
          return {
            userId: profile.user_id,
            name: profile.name,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Face recognition error:", error);
      return null;
    }
  }, [detectFace]);

  // Check if user has face enrolled
  const hasFaceEnrolled = useCallback(async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("face_descriptor")
      .eq("user_id", userId)
      .single();

    if (error || !data) return false;
    return data.face_descriptor !== null;
  }, []);

  // Remove enrolled face
  const removeFaceEnrollment = useCallback(async (userId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("profiles")
      .update({ face_descriptor: null })
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to remove face data.");
      return false;
    }

    toast.success("Face enrollment removed.");
    return true;
  }, []);

  // Initialize models on mount
  useEffect(() => {
    loadModels();
    
    return () => {
      stopCamera();
    };
  }, [loadModels, stopCamera]);

  return {
    ...state,
    startCamera,
    stopCamera,
    detectFace,
    enrollFace,
    recognizeFace,
    hasFaceEnrolled,
    removeFaceEnrollment,
    loadModels,
  };
};
