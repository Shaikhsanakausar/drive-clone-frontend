import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HeroSection } from "@/components/ui/hero-section-dark";
import dashboardLight from "@/assets/dashboard-light.png";
import dashboardDark from "@/assets/dashboard-dark.png";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        title="Secure File Sharing Made Simple"
        subtitle={{
          regular: "Store, share, and collaborate with ",
          gradient: "unlimited cloud storage.",
        }}
        description="Experience the next generation of file sharing with end-to-end encryption, real-time collaboration, and seamless access from anywhere. Your files, your control."
        ctaText="Sign In"
        ctaHref="/auth"
        bottomImage={{
          light: dashboardLight,
          dark: dashboardDark,
        }}
        gridOptions={{
          angle: 65,
          opacity: 0.4,
          cellSize: 50,
          lightLineColor: "#e0e7ff",
          darkLineColor: "#3730a3",
        }}
      />
    </div>
  );
};

export default Index;
