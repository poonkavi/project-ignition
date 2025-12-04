import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  phrase: string;
  variant?: "default" | "emergency";
  isActive?: boolean;
  onClick: (phrase: string) => void;
}

const QuickActionButton = ({
  icon: Icon,
  label,
  phrase,
  variant = "default",
  isActive = false,
  onClick,
}: QuickActionButtonProps) => {
  return (
    <button
      onClick={() => onClick(phrase)}
      className={cn(
        "flex min-h-[100px] w-full flex-col items-center justify-center gap-3 rounded-xl p-4 text-center transition-all duration-200 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === "emergency"
          ? "bg-emergency text-emergency-foreground shadow-lg shadow-emergency/30 hover:bg-emergency/90 focus:ring-emergency"
          : "bg-card border border-border shadow-sm hover:bg-accent hover:shadow-md focus:ring-primary",
        isActive && variant === "default" && "ring-2 ring-primary bg-primary/10",
        isActive && variant === "emergency" && "ring-2 ring-emergency-foreground animate-pulse"
      )}
      aria-pressed={isActive}
    >
      <Icon
        className={cn(
          "h-8 w-8",
          variant === "emergency" ? "text-emergency-foreground" : "text-primary"
        )}
      />
      <span
        className={cn(
          "text-sm font-semibold leading-tight",
          variant === "emergency" ? "text-emergency-foreground" : "text-foreground"
        )}
      >
        {label}
      </span>
    </button>
  );
};

export default QuickActionButton;
