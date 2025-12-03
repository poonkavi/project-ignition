import { ReactNode } from "react";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNavigation?: boolean;
  patientName?: string;
}

const Layout = ({ 
  children, 
  showHeader = true, 
  showNavigation = true,
  patientName 
}: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background safe-area-inset">
      {showHeader && <Header patientName={patientName} />}
      
      <main className="flex-1 pb-20">
        {children}
      </main>
      
      {showNavigation && <BottomNavigation />}
    </div>
  );
};

export default Layout;
