"use client";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Basic",
    price: "₦490",
    period: "/mo",
    color: "bg-muted",
    textColor: "text-foreground",
    buttonVariant: "outline" as const,
    features: [
      "5 Active listings",
      "Basic analytics",
      "Email support",
      "1 Team member",
    ],
  },
  {
    name: "Silver",
    price: "₦15",
    period: "k/mo",
    color: "bg-primary",
    textColor: "text-primary-foreground",
    buttonVariant: "secondary" as const,
    popular: true,
    features: [
      "25 Active listings",
      "Advanced analytics",
      "Priority support",
      "5 Team members",
      "Custom branding",
    ],
  },
  {
    name: "Platinum",
    price: "₦150",
    period: "k/mo",
    color: "bg-accent",
    textColor: "text-accent-foreground",
    buttonVariant: "outline" as const,
    features: [
      "Unlimited listings",
      "Full analytics suite",
      "24/7 Dedicated support",
      "Unlimited team members",
      "Custom branding",
      "API access",
    ],
  },
];

const SubscriptionPlans = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Subscription Plan</h2>
        <p className="text-muted-foreground text-sm mt-1">Choose the plan that works best for you.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "rounded-2xl p-6 relative overflow-hidden flex flex-col",
              plan.color,
              plan.textColor
            )}
          >
            {plan.popular && (
              <span className="absolute top-3 right-3 bg-card text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
                Popular
              </span>
            )}
            <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
            <div className="flex items-end gap-0.5 mb-4">
              <span className="text-3xl font-display font-extrabold">{plan.price}</span>
              <span className="text-sm opacity-80 mb-1">{plan.period}</span>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0" strokeWidth={1} />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.popular ? "secondary" : "outline"}
              className={cn(
                "w-full rounded-xl font-semibold",
                plan.popular && "bg-card text-primary hover:bg-card/90"
              )}
            >
              Get Started
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
