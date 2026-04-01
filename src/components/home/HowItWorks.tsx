import { Search, UserCheck, Briefcase, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    { icon: Search, step: "01", title: "Search & Discover", description: "Browse verified artisans and quality materials based on your location and project needs." },
    { icon: UserCheck, step: "02", title: "Review & Compare", description: "Check ratings, reviews, portfolios, and prices to find the perfect match for your project." },
    { icon: Briefcase, step: "03", title: "Hire or Purchase", description: "Book services or add products to cart. Connect directly with sellers and artisans." },
    { icon: CheckCircle, step: "04", title: "Complete & Review", description: "Track progress, make secure payments, and leave reviews to help the community." },
  ];

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">How Sintherior Works</h2>
          <p className="text-muted-foreground text-lg">
            Get started in minutes. Find what you need, connect with professionals, and complete your projects.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative" data-aos="fade-up" data-aos-delay={index * 120}>
              {/* {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-[2px] bg-border" />
              )} */}
              <div className="relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-display text-xs font-bold text-primary">{step.step}</span>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
                  <step.icon strokeWidth={1} className="w-9 h-9 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
