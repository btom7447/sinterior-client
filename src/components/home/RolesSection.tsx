import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hammer, Store, HardHat, ArrowRight } from "lucide-react";

const RolesSection = () => {
  const roles = [
    {
      icon: Hammer,
      title: "Artisans & Workers",
      description: "Showcase your skills, find jobs, and grow your reputation with verified reviews.",
      benefits: ["Create service listings", "Receive job requests", "Build your portfolio", "Get paid securely"],
      cta: "Join as Artisan",
      href: "/signup?role=artisan",
      color: "primary",
    },
    {
      icon: Store,
      title: "Suppliers & Sellers",
      description: "List your construction materials and reach thousands of buyers across Nigeria.",
      benefits: ["Product marketplace", "Inventory management", "Order tracking", "Business analytics"],
      cta: "Start Selling",
      href: "/signup?role=supplier",
      color: "accent",
    },
    {
      icon: HardHat,
      title: "Clients & Contractors",
      description: "Find verified professionals and quality materials for all your building projects.",
      benefits: ["Browse services", "Compare prices", "Hire with confidence", "Track projects"],
      cta: "Find Services",
      href: "/signup?role=client",
      color: "success",
    },
  ];

  return (
    <section className="section-padding bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">One Platform, Multiple Roles</h2>
          <p className="text-muted-foreground text-lg">Whether you&apos;re building, selling, or providing services, Sintherior has the tools you need.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {roles.map((role, i) => (
            <div
              key={role.title}
              className="card-elevated p-6 lg:p-8 group hover:border-primary/20"
              data-aos="fade-up"
              data-aos-delay={i * 120}
            >
              <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${role.color === "primary" ? "bg-primary/10" : role.color === "accent" ? "bg-accent/10" : "bg-success/10"}`}>
                <role.icon strokeWidth={1} className={`w-7 h-7 ${role.color === "primary" ? "text-primary" : role.color === "accent" ? "text-accent" : "text-success"}`} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{role.title}</h3>
              <p className="text-muted-foreground mb-6">{role.description}</p>
              <ul className="space-y-3 mb-8">
                {role.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link href={role.href}>
                <Button className="w-full rounded-xl border border-primary bg-transparent hover:bg-primary text-primary hover:text-white transition-colors">
                  {role.cta} <ArrowRight strokeWidth={1} className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
