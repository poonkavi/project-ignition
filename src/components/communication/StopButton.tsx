import { Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface StopButtonProps {
  onClick: () => void;
  isVisible: boolean;
  currentPhrase?: string;
}

const StopButton = ({ onClick, isVisible, currentPhrase }: StopButtonProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 px-4">
      <div className="mx-auto max-w-md">
        <button
          onClick={onClick}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-xl bg-emergency p-6 text-emergency-foreground shadow-2xl shadow-emergency/40",
            "transition-transform duration-200 active:scale-95",
            "animate-pulse focus:outline-none focus:ring-4 focus:ring-emergency/50"
          )}
          aria-label="Stop speaking"
        >
          <Square className="h-8 w-8 fill-current" />
          <div className="flex flex-col items-start">
            <span className="text-xl font-bold">STOP</span>
            {currentPhrase && (
              <span className="text-sm opacity-90 truncate max-w-[200px]">
                Playing: {currentPhrase}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default StopButton;
