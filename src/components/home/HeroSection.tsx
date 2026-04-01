"use client";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, ShoppingBag, Wrench, MapPin, Navigation } from "lucide-react";

const statsData = [
  { target: 5000, suffix: "+", label: "Active Artisans" },
  { target: 12000, suffix: "+", label: "Products Listed" },
  { target: 50, suffix: "+", label: "Cities Covered" },
];

const HeroSection = () => {
  const [counts, setCounts] = useState([0, 0, 0]);
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 60;
          statsData.forEach((stat, idx) => {
            const increment = stat.target / steps;
            let current = 0;
            const timer = setInterval(() => {
              current = Math.min(current + increment, stat.target);
              setCounts((prev) => {
                const next = [...prev];
                next[idx] = Math.round(current);
                return next;
              });
              if (current >= stat.target) clearInterval(timer);
            }, duration / steps);
          });
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Geolocation Banner */}
        <div
          data-aos="fade-down"
          className="mb-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Navigation strokeWidth={1} className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin strokeWidth={1} className="w-4 h-4 text-primary" />
              <p className="font-display font-semibold text-foreground text-sm sm:text-base">Location-Based Search</p>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              This app uses geolocation services to find skilled artisans near you — just like Bolt connects you with nearby drivers.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div data-aos="fade-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Now live in Nigeria
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Build Better with{" "}
              <span className="gradient-text">Trusted Artisans</span>{" "}
              & Quality Materials
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Sintherior connects you with verified construction professionals, premium suppliers, and everything you need to bring your building projects to life.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {["Verified Professionals", "Quality Materials", "Secure Payments"].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 strokeWidth={1} className="w-5 h-5 text-success" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button className="btn-hero group">
                  Get Started Free
                  <ArrowRight strokeWidth={1} className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/artisan">
                <Button variant="outline" className="btn-hero-outline">Find Artisans</Button>
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div data-aos="fade-left" className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
                alt="Construction workers"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
                <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users strokeWidth={1} className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Skilled Artisans</p>
                    <p className="text-sm text-muted-foreground">Verified & Ready to Work</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-card/95 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 shadow-lg">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <ShoppingBag strokeWidth={1} className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">12K+</p>
                      <p className="text-xs text-muted-foreground">Products</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-card/95 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 shadow-lg">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Wrench strokeWidth={1} className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">5K+</p>
                      <p className="text-xs text-muted-foreground">Artisans</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="mt-16 lg:mt-24 grid grid-cols-3 gap-8">
          {statsData.map((stat, i) => (
            <div key={stat.label} className="text-center" data-aos="fade-up" data-aos-delay={i * 100}>
              <p className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-1">
                {counts[i].toLocaleString()}{stat.suffix}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
