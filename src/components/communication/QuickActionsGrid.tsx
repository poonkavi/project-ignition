import {
  Utensils,
  HeartPulse,
  Droplets,
  AlertTriangle,
  HelpCircle,
  Bath,
} from "lucide-react";
import QuickActionButton from "./QuickActionButton";

const quickActions = [
  {
    icon: Utensils,
    label: "I am hungry",
    phrase: "I am hungry. Please bring me food.",
    variant: "default" as const,
  },
  {
    icon: HeartPulse,
    label: "I feel pain",
    phrase: "I am in pain. Please help me.",
    variant: "default" as const,
  },
  {
    icon: Droplets,
    label: "Water please",
    phrase: "I need water. Please bring me some water.",
    variant: "default" as const,
  },
  {
    icon: AlertTriangle,
    label: "Emergency",
    phrase: "Emergency! I need immediate help! Please come quickly!",
    variant: "emergency" as const,
  },
  {
    icon: HelpCircle,
    label: "Help me",
    phrase: "I need help. Please assist me.",
    variant: "default" as const,
  },
  {
    icon: Bath,
    label: "Restroom",
    phrase: "I need to go to the restroom. Please help me.",
    variant: "default" as const,
  },
];

interface QuickActionsGridProps {
  onSpeak: (phrase: string) => void;
  currentPhrase: string;
}

const QuickActionsGrid = ({ onSpeak, currentPhrase }: QuickActionsGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {quickActions.map((action) => (
        <QuickActionButton
          key={action.label}
          icon={action.icon}
          label={action.label}
          phrase={action.phrase}
          variant={action.variant}
          isActive={currentPhrase === action.phrase}
          onClick={onSpeak}
        />
      ))}
    </div>
  );
};

export default QuickActionsGrid;
