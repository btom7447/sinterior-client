import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <MobileHeader />
      <main className="pb-20 lg:pb-0">
        {children}
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default AppLayout;
