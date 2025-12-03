import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg">
            <Mic className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-3xl font-bold text-foreground">
          My Voice Dictionary
        </h1>
        
        {/* Subtitle */}
        <p className="mb-8 text-lg text-muted-foreground">
          Your voice when you need it most
        </p>

        {/* Description */}
        <p className="mb-10 text-base text-muted-foreground">
          Communicate your essential needs clearly with pre-programmed voice messages and custom phrases.
        </p>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/login")}
            className="w-full min-h-[52px] text-lg font-medium"
            size="lg"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            onClick={() => navigate("/register")}
            variant="outline"
            className="w-full min-h-[52px] text-lg font-medium"
            size="lg"
          >
            Create Account
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-sm text-muted-foreground">
          Designed for patients with speech difficulties
        </p>
      </div>
    </div>
  );
};

export default Index;
