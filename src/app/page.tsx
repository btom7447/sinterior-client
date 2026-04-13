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
        url: `${SITE_URL}/icon.png`,
        width: 208,
        height: 208,
      },
      description:
        "Nigeria's trusted marketplace for hiring verified artisans (plumbers, electricians, carpenters, painters) and buying quality building materials from verified suppliers.",
      areaServed: {
        "@type": "Country",
        name: "Nigeria",
      },
      sameAs: [
        "https://twitter.com/sintherior",
        "https://www.facebook.com/sintherior",
        "https://www.instagram.com/sintherior",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Sintherior",
      description:
        "Hire verified artisans and buy quality building materials across Nigeria. Find plumbers, electricians, carpenters, and more near you.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/artisan?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      ],
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
