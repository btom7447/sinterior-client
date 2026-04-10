import AppLayout from "@/components/layout/AppLayout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedServices from "@/components/home/FeaturedServices";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturedRealEstate from "@/components/home/FeaturedRealEstate";
import HowItWorks from "@/components/home/HowItWorks";
import RolesSection from "@/components/home/RolesSection";
import CTASection from "@/components/home/CTASection";
import AOSInit from "@/components/home/AOSInit";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.sintherior.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Sintherior",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-image.png`,
      },
      description:
        "Marketplace connecting clients with verified artisans, suppliers, and building materials across Nigeria.",
      areaServed: {
        "@type": "Country",
        name: "Nigeria",
      },
      sameAs: [
        "https://twitter.com/sintherior",
        "https://www.facebook.com/sintherior",
        "https://www.instagram.com/sintherior",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Sintherior",
      description:
        "Connect with verified construction professionals, premium suppliers, and everything you need to bring your building projects to life.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/artisan?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      inLanguage: "en-NG",
    },
  ],
};

export default function LandingPage() {
  return (
    <AppLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
