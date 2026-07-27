import type { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedServices from "@/components/home/FeaturedServices";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturedRealEstate from "@/components/home/FeaturedRealEstate";
import HowItWorks from "@/components/home/HowItWorks";
import RolesSection from "@/components/home/RolesSection";
import CTASection from "@/components/home/CTASection";
import AOSInit from "@/components/home/AOSInit";

export const metadata: Metadata = {
  title: "Welcome to Sintherior — How It Works",
  description:
    "Hire verified Nigerian artisans, buy quality building materials, and browse properties. See how Sintherior works.",
  alternates: { canonical: "/welcome" },
};

/**
 * The original landing page, relocated when the feed became home
 * (DECISIONS 2026-07-27). Serves as the marketing / how-it-works surface;
 * the company story lives at /about.
 */
export default function WelcomePage() {
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
