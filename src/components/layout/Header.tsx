import { Mic } from "lucide-react";

interface HeaderProps {
  patientName?: string;
}

const Header = ({ patientName }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Mic className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">My Voice Dictionary</h1>
            {patientName && (
              <p className="text-sm text-muted-foreground">{patientName}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
