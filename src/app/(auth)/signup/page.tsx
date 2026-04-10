"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { apiUpload } from "@/lib/apiClient";
import RoleSelector, { roles } from "@/components/signup/RoleSelector";
import AccountDetailsForm, { AccountFormData } from "@/components/signup/AccountDetailsForm";
import ArtisanDetailsForm, { ArtisanFormData } from "@/components/signup/ArtisanDetailsForm";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signUp, refreshProfile } = useAuth();

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
      // 1. Register — creates User + Profile (+ empty ArtisanProfile if artisan)
      const data = await signUp({
        email: accountData.email,
        password: accountData.password,
        role: selectedRole || "client",
        fullName: accountData.fullName,
        city: accountData.city,
        state: accountData.state,
        phone: accountData.phone,
      });

      const profileId = data.data.user.profile?.id;

      // 2. Upload avatar if provided
      if (accountData.avatarFile && profileId) {
        try {
          const form = new FormData();
          form.append("avatar", accountData.avatarFile);
          await apiUpload("/profiles/me/avatar", form);
          await refreshProfile(); // reload profile so avatar shows immediately
        } catch (err) {
          console.error("[SIGNUP] Avatar upload failed:", err);
          toast.error("Profile photo couldn't be uploaded. You can add it later in settings.");
        }
      }

      // 3. If artisan, save skill details to the scaffolded artisan profile
      if (selectedRole === "artisan") {
        try {
          const { apiPatch } = await import("@/lib/apiClient");
          await apiPatch("/artisans/onboarding", {
            skill: artisanData.skill,
            skillCategory: artisanData.skillCategory,
            pricePerDay: artisanData.pricePerDay,
            experienceYears: artisanData.experienceYears,
            address: artisanData.address,
          });
          if (artisanData.latitude && artisanData.longitude) {
            await apiPatch("/artisans/location", {
              lat: artisanData.latitude,
              lng: artisanData.longitude,
            }).catch(() => {});
          }
        } catch {
          // Non-fatal — onboarding flow will collect this
        }
      }

      toast.success("Account created! Welcome to Sintherior.");

      if (selectedRole === "artisan") {
        router.push("/onboarding/artisan");
      } else if (selectedRole === "supplier") {
        router.push("/onboarding/supplier");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create account";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getBackLink = () => (step === 1 ? "/" : "#");

  const handleBackClick = (e: React.MouseEvent) => {
    if (step === 2) { e.preventDefault(); setStep(1); }
    else if (step === 3) { e.preventDefault(); setStep(2); }
  };

  const getBackText = () => {
    if (step === 1) return "Back to home";
    if (step === 2) return "Choose different role";
    return "Back to account details";
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
              <Image src="/logo.png" alt="Sintherior" width={48} height={48} className="rounded-xl" />
              <span className="font-display font-bold text-xl text-foreground">Sintherior</span>
            </div>

            {selectedRole === "artisan" && step >= 2 && (
              <div className="flex items-center gap-2 mb-6">
                <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
                <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
              </div>
            )}

            {step === 1 && (
              <RoleSelector selectedRole={selectedRole} onSelectRole={handleRoleSelect} />
            )}

            {step === 2 && (
              <>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    {roles.find((r) => r.id === selectedRole)?.title}
                  </div>
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create your account</h1>
                  <p className="text-muted-foreground">
                    {selectedRole === "artisan" ? "Step 1: Fill in your basic details" : "Fill in your details to get started"}
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
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">Your Skills &amp; Pricing</h1>
                  <p className="text-muted-foreground">Step 2: Tell us about your expertise</p>
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

      {/* Right Side - Image */}
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
