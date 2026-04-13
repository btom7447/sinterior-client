import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sintherior – Build Better with Trusted Artisans",
    short_name: "Sintherior",
    description:
      "Verified construction professionals, premium suppliers, and quality building materials across Nigeria.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a1a1a",
    orientation: "portrait-primary",
    categories: ["business", "shopping", "productivity"],
    lang: "en",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "208x208",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "208x208",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
