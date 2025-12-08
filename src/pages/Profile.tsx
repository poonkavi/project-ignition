import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Save, Camera, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useFaceRecognition } from "@/hooks/useFaceRecognition";
import { FaceEnrollment } from "@/components/FaceEnrollment";

const medicalConditions = [
  "Stroke Recovery",
  "Post-Surgery",
  "Paralysis",
  "Coma Recovery",
  "ALS",
  "Parkinson's Disease",
  "Multiple Sclerosis",
  "Dementia",
  "Autism",
  "Other",
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { hasFaceEnrolled, removeFaceEnrollment } = useFaceRecognition();
  const [saving, setSaving] = useState(false);
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [checkingFace, setCheckingFace] = useState(true);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setAge(profile.age?.toString() || "");
      setMedicalCondition(profile.medical_condition || "");
    }
  }, [profile]);

  // Check if face is enrolled
  useEffect(() => {
    const checkFaceEnrollment = async () => {
      if (user) {
        const enrolled = await hasFaceEnrolled(user.id);
        setFaceEnrolled(enrolled);
        setCheckingFace(false);
      }
    };
    checkFaceEnrollment();
  }, [user, hasFaceEnrolled]);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setSaving(true);
    await updateProfile({
      name: name.trim(),
      age: age ? parseInt(age) : null,
      medical_condition: medicalCondition || null,
    });
    setSaving(false);
  };

  const handleRemoveFace = async () => {
    if (!user) return;
    const success = await removeFaceEnrollment(user.id);
    if (success) {
      setFaceEnrolled(false);
    }
  };

  if (authLoading || profileLoading) {
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
    <Layout>
      <div className="container px-4 py-6 pb-24">
        <h2 className="mb-6 text-xl font-semibold text-foreground">Patient Profile</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={0}
              max={150}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Medical Condition</Label>
            <Select value={medicalCondition} onValueChange={setMedicalCondition}>
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {medicalConditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This helps customize your communication options
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Email:</strong> {user.email}
            </p>
          </div>

          {/* Face Recognition Section */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Emergency Face Login
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {checkingFace 
                    ? "Checking..."
                    : faceEnrolled 
                      ? "Face enrolled for emergency access"
                      : "Enable quick login using face recognition"
                  }
                </p>
              </div>
              
              {!checkingFace && (
                faceEnrolled ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRemoveFace}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                ) : (
                  <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-1" />
                        Setup
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Face Enrollment</DialogTitle>
                        <DialogDescription>
                          Enable emergency face login for quick access when you need help.
                        </DialogDescription>
                      </DialogHeader>
                      <FaceEnrollment 
                        onComplete={() => {
                          setFaceEnrolled(true);
                          setEnrollDialogOpen(false);
                        }}
                        onCancel={() => setEnrollDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                )
              )}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Profile
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
