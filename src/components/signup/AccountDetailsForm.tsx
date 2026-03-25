"use client";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AvatarUpload from "./AvatarUpload";

export interface AccountFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  state: string;
  avatarFile: File | null;
  avatarPreview: string | null;
}

interface AccountDetailsFormProps {
  formData: AccountFormData;
  setFormData: (data: AccountFormData) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isArtisan?: boolean;
  isLoading?: boolean;
}

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const AccountDetailsForm = ({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  onSubmit,
  isArtisan = false,
  isLoading = false,
}: AccountDetailsFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <AvatarUpload
        avatarFile={formData.avatarFile}
        avatarPreview={formData.avatarPreview}
        onFileSelect={(file, preview) => setFormData({ ...formData, avatarFile: file, avatarPreview: preview })}
      />

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" placeholder="John Doe" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="py-6 rounded-xl" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="py-6 rounded-xl" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" type="tel" placeholder="+234 800 000 0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="py-6 rounded-xl" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <select
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            <option value="">Select state</option>
            {nigerianStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Lagos" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="py-6 rounded-xl" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="py-6 rounded-xl pr-12"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full py-6 rounded-xl text-lg" disabled={isLoading}>
        {isLoading ? "Creating account..." : isArtisan ? "Continue" : "Create account"}
      </Button>
    </form>
  );
};

export default AccountDetailsForm;
