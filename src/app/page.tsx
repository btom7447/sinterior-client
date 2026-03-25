import AppLayout from "@/components/layout/AppLayout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedServices from "@/components/home/FeaturedServices";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturedRealEstate from "@/components/home/FeaturedRealEstate";
import HowItWorks from "@/components/home/HowItWorks";
import RolesSection from "@/components/home/RolesSection";
import CTASection from "@/components/home/CTASection";
import AOSInit from "@/components/home/AOSInit";

export default function LandingPage() {
  return (
    <AppLayout>
      <AOSInit />
      <HeroSection />
      <HowItWorks />
      <FeaturedServices />
      <FeaturedProducts />
      <FeaturedRealEstate />
      <RolesSection />
      <CTASection />
    </AppLayout>
  );
}
