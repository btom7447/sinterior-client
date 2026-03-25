"use client";
import { Hammer, Store, HardHat, CheckCircle2 } from "lucide-react";

interface Role {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const roles: Role[] = [
  {
    id: "artisan",
    icon: Hammer,
    title: "Artisan / Worker",
    description: "Offer your construction skills and services",
  },
  {
    id: "supplier",
    icon: Store,
    title: "Supplier / Seller",
    description: "Sell construction materials and products",
  },
  {
    id: "client",
    icon: HardHat,
    title: "Client / Contractor",
    description: "Find artisans and buy materials",
  },
];

interface RoleSelectorProps {
  selectedRole: string;
  onSelectRole: (roleId: string) => void;
}

const RoleSelector = ({ selectedRole, onSelectRole }: RoleSelectorProps) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Join Sinterior</h1>
        <p className="text-muted-foreground">Choose how you want to use the platform</p>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
              selectedRole === role.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-secondary/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <role.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{role.title}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
              {selectedRole === role.id && <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />}
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default RoleSelector;
export { roles };
