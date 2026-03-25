"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RoleSelector, { roles } from "@/components/signup/RoleSelector";
import AccountDetailsForm, { AccountFormData } from "@/components/signup/AccountDetailsForm";
import ArtisanDetailsForm, { ArtisanFormData } from "@/components/signup/ArtisanDetailsForm";
import { Suspense } from "react";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRole = searchParams.get("role") || "";

  const [step, setStep] = useState(initialRole ? 2 : 1);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [accountData, setAccountData] = useState<AccountFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    state: "",
    avatarFile: null,
    avatarPreview: null,
  });

  const [artisanData, setArtisanData] = useState<ArtisanFormData>({
    skillCategory: "",
    skill: "",
    experienceYears: 0,
    pricePerDay: 0,
    bio: "",
    address: "",
    latitude: null,
    longitude: null,
  });

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setStep(2);
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "artisan") {
      setStep(3);
    } else {
      handleSignup();
    }
  };

  const handleArtisanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignup();
  };

  const handleSignup = async () => {
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: accountData.email,
        password: accountData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: accountData.fullName,
            phone: accountData.phone,
            role: selectedRole,
            bio: selectedRole === "artisan" ? artisanData.bio : null,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user returned from signup");

      const userId = authData.user.id;

      let avatarUrl: string | null = null;
      if (accountData.avatarFile) {
        const fileExt = accountData.avatarFile.name.split(".").pop();
        const filePath = `${userId}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, accountData.avatarFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          avatarUrl = urlData.publicUrl;
        }
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", userId)
        .select()
        .single();

      if (selectedRole === "artisan" && profileData) {
        const { error: artisanError } = await supabase
          .from("artisan_profiles")
          .insert({
            profile_id: profileData.id,
            skill: artisanData.skill,
            skill_category: artisanData.skillCategory,
            city: accountData.city,
            state: accountData.state,
            address: artisanData.address || null,
            price_per_day: artisanData.pricePerDay,
            experience_years: artisanData.experienceYears,
            latitude: artisanData.latitude,
            longitude: artisanData.longitude,
            is_available: true,
          });

        if (artisanError) throw artisanError;
      }

      toast.success("Account created! Please check your email to verify.");
      router.push("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const getBackLink = () => {
    if (step === 1) return "/";
    return "#";
  };

  const handleBackClick = (e: React.MouseEvent) => {
    if (step === 2) {
      e.preventDefault();
      setStep(1);
    } else if (step === 3) {
      e.preventDefault();
      setStep(2);
    }
  };

  const getBackText = () => {
    if (step === 1) return "Back to home";
    if (step === 2) return "Choose different role";
    if (step === 3) return "Back to account details";
    return "Back";
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Side - Form (scrollable) */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-20 py-12 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <Link
            href={getBackLink()}
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft strokeWidth={1} className="w-4 h-4" />
            {getBackText()}
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xl">S</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">Sinterior</span>
          </div>

          {selectedRole === "artisan" && step >= 2 && (
            <div className="flex items-center gap-2 mb-6">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
            </div>
          )}

          {step === 1 && (
            <RoleSelector
              selectedRole={selectedRole}
              onSelectRole={handleRoleSelect}
            />
          )}

          {step === 2 && (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  {roles.find((r) => r.id === selectedRole)?.title}
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Create your account
                </h1>
                <p className="text-muted-foreground">
                  {selectedRole === "artisan"
                    ? "Step 1: Fill in your basic details"
                    : "Fill in your details to get started"}
                </p>
              </div>

              <AccountDetailsForm
                formData={accountData}
                setFormData={setAccountData}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                onSubmit={handleAccountSubmit}
                isArtisan={selectedRole === "artisan"}
                isLoading={isLoading}
              />
            </>
          )}

          {step === 3 && selectedRole === "artisan" && (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  {roles.find((r) => r.id === selectedRole)?.title}
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Your Skills &amp; Pricing
                </h1>
                <p className="text-muted-foreground">
                  Step 2: Tell us about your expertise
                </p>
              </div>

              <ArtisanDetailsForm
                formData={artisanData}
                setFormData={setArtisanData}
                onSubmit={handleArtisanSubmit}
                onBack={() => setStep(2)}
                isLoading={isLoading}
              />
            </>
          )}

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        </div>
      </div>

      {/* Right Side - Image (fixed, full height) */}
      <div className="hidden lg:block lg:w-1/2 sticky top-0 h-screen shrink-0">
        <img
          src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80"
          alt="Construction workers"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/60" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <h2 className="font-display text-4xl font-bold text-background mb-4">
              {step === 3 ? "Almost There!" : "Join the Community"}
            </h2>
            <p className="text-background/80 text-lg max-w-md">
              {step === 3
                ? "Complete your profile to start receiving job requests from clients in your area."
                : "Over 5,000 artisans and 12,000 products already on the platform. Start building your success today."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <SignupContent />
    </Suspense>
  );
}
