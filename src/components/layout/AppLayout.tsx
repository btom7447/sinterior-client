import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileHeader from "./MobileHeader";

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
      <main className="">
        {children}
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
