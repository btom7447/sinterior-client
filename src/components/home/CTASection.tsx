import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-foreground" data-aos="fade-up">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative px-6 sm:px-12 py-16 sm:py-20 flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-background mb-4">
                Ready to Build Something Amazing?
              </h2>
              <p className="text-background/70 text-lg mb-8 max-w-xl mx-auto lg:mx-0">
                Join thousands of artisans, suppliers, and clients already using Sintherior to transform the construction industry in Nigeria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-xl text-lg font-semibold group">
                    Create Free Account
                    <ArrowRight strokeWidth={1} className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/artisan">
                  <Button variant="outline" className="border-background/30 text-background bg-transparent hover:bg-background/10 px-8 py-6 rounded-xl text-lg font-semibold">
                    Explore Artisans
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-64 h-auto rounded-3xl bg-card shadow-2xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone strokeWidth={1} className="w-5 h-5 text-primary" />
                    <span className="font-display font-semibold text-foreground text-sm">Sintherior App</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-24 rounded-xl bg-secondary animate-pulse" />
                    <div className="h-4 w-3/4 rounded bg-secondary" />
                    <div className="h-4 w-1/2 rounded bg-secondary" />
                    <div className="h-10 rounded-lg bg-primary/20" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-56 h-auto rounded-2xl bg-card shadow-xl p-3 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <span className="text-success text-lg">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Job Completed!</p>
                      <p className="text-xs text-muted-foreground">Payment released</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
