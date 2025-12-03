import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [patientName, setPatientName] = useState<string>("Patient");

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
          .select("name")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (data?.name) {
          setPatientName(data.name);
        }
      }
    };

    fetchProfile();
  }, [user]);

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
      <div className="container px-4 py-6">
        <h2 className="mb-6 text-xl font-semibold text-foreground">Quick Actions</h2>
        <p className="text-muted-foreground">Dashboard with communication buttons - Coming in Phase 3</p>
      </div>
    </Layout>
  );
};

export default Dashboard;
