import type { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import { Users, Target, Award, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About Sintherior",
  description:
    "Sintherior is building Nigeria's most trusted marketplace for construction professionals and building materials. Learn our story, mission, and values.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Sintherior",
    description:
      "Learn how Sintherior connects verified artisans, quality suppliers, and clients across Nigeria.",
    url: "/about",
    type: "website",
  },
};

const stats = [
  { value: "5,000+", label: "Active Artisans" },
  { value: "1,200+", label: "Verified Suppliers" },
  { value: "20,000+", label: "Projects Completed" },
  { value: "36", label: "States Covered" },
];

const values = [
  {
    icon: Users,
    title: "Community First",
    description:
      "We built Sintherior to empower Nigerian construction professionals — artisans, suppliers, and clients — with tools that were previously out of reach.",
  },
  {
    icon: Target,
    title: "Quality Focused",
    description:
      "Every artisan and supplier on our platform goes through a verification process so clients can trust the people they hire and the products they buy.",
  },
  {
    icon: Award,
    title: "Excellence Driven",
    description:
      "We measure success by the quality of projects our community delivers — not just the number of transactions on the platform.",
  },
  {
    icon: Globe,
    title: "Built for Nigeria",
    description:
      "From Lagos to Kano, Enugu to Port Harcourt — Sintherior is designed around the realities of the Nigerian construction market.",
  },
];

const team = [
  {
    name: "Tomiwa Adeyemi",
    role: "Co-Founder & CEO",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80",
  },
  {
    name: "Chioma Okafor",
    role: "Co-Founder & COO",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
  },
  {
    name: "Emeka Nwosu",
    role: "Head of Engineering",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    name: "Fatima Bello",
    role: "Head of Operations",
    avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=200&q=80",
  },
];

export default function AboutPage() {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="badge-role mb-4 inline-block">About Sintherior</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              Building Nigeria's Construction <span className="gradient-text">Ecosystem</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sintherior is a platform connecting verified artisans, trusted suppliers, and
              clients across Nigeria. We make it simple to find skilled professionals, source
              quality materials, and manage construction projects from start to finish.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-role mb-4 inline-block">Our Mission</span>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Making quality construction accessible to everyone
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Nigerian construction industry is worth trillions of naira, yet most of its
                participants — talented artisans, reputable suppliers, ambitious homebuilders —
                operate in silos, relying on word-of-mouth and guesswork.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We started Sintherior to change that. By bringing verification, transparency, and
                digital tools to the sector, we help professionals grow their businesses and
                clients build with confidence.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
                alt="Construction site in Nigeria"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge-role mb-4 inline-block">Our Values</span>
            <h2 className="font-display text-3xl font-bold text-foreground">What we stand for</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="card-elevated p-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <v.icon strokeWidth={1} className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge-role mb-4 inline-block">Our Team</span>
            <h2 className="font-display text-3xl font-bold text-foreground">The people behind Sintherior</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
                />
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
