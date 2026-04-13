"use client";

import { use, useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { ArrowLeft, Ban, CheckCircle, Mail, MessageSquare, Shield, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { toast } from "sonner";

interface UserDetail {
  user: {
    _id: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    isBanned?: boolean;
    createdAt: string;
    lastLogin: string | null;
  };
  profile: {
    _id: string;
    fullName: string;
    avatarUrl: string | null;
    phone?: string;
    city?: string;
    state?: string;
    bio?: string;
    role: string;
  } | null;
  roleProfile: {
    isVerified?: boolean;
    businessName?: string;
    skills?: string[];
    hourlyRate?: number;
    categories?: string[];
  } | null;
  stats: { orders: number; jobs: number; disputes: number };
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: UserDetail }>(`/admin/users/${id}`);
      setData(res.data);
    } catch {
      toast.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleBan = async () => {
    if (!data) return;
    try {
      await apiPatch(`/admin/users/${id}`, { isBanned: !data.user.isBanned });
      toast.success(data.user.isBanned ? "User unbanned" : "User banned");
      fetchUser();
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">User not found</div>;
  }

  const { user, profile, roleProfile, stats } = data;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to users
      </Link>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile?.avatarUrl || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {profile?.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-display font-bold text-foreground">
                {profile?.fullName || "(No profile)"}
              </h1>
              <span className="px-2 py-0.5 rounded-lg text-xs font-medium capitalize bg-secondary text-foreground">
                {user.role}
              </span>
              {roleProfile?.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-600">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
              {user.isBanned && (
                <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive">
                  Banned
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
              {user.isEmailVerified && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
            </div>
            {(profile?.city || profile?.state) && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {[profile.city, profile.state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href={`/admin/chat?user=${user._id}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Message
            </Link>
            <button
              onClick={handleToggleBan}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                user.isBanned
                  ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                  : "bg-destructive/10 text-destructive hover:bg-destructive/20"
              }`}
            >
              {user.isBanned ? (
                <>
                  <Shield className="w-4 h-4" /> Unban
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" /> Ban
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="text-2xl font-display font-bold text-foreground mt-1">{stats.orders}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Jobs</p>
          <p className="text-2xl font-display font-bold text-foreground mt-1">{stats.jobs}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Disputes</p>
          <p className="text-2xl font-display font-bold text-foreground mt-1">{stats.disputes}</p>
        </div>
      </div>

      {/* Profile details */}
      {profile && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-foreground mb-4">Profile</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {profile.phone && (
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="text-foreground">{profile.phone}</dd>
              </div>
            )}
            {profile.bio && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Bio</dt>
                <dd className="text-foreground whitespace-pre-wrap">{profile.bio}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Role-specific profile */}
      {roleProfile && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-foreground mb-4 capitalize">
            {user.role} Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {roleProfile.businessName && (
              <div>
                <dt className="text-muted-foreground">Business Name</dt>
                <dd className="text-foreground">{roleProfile.businessName}</dd>
              </div>
            )}
            {roleProfile.hourlyRate !== undefined && (
              <div>
                <dt className="text-muted-foreground">Hourly Rate</dt>
                <dd className="text-foreground">₦{roleProfile.hourlyRate.toLocaleString()}</dd>
              </div>
            )}
            {roleProfile.skills && roleProfile.skills.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground mb-1">Skills</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {roleProfile.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-lg bg-secondary text-xs text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {roleProfile.categories && roleProfile.categories.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground mb-1">Categories</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {roleProfile.categories.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-lg bg-secondary text-xs text-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Account meta */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display font-semibold text-foreground mb-4">Account</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Joined</dt>
            <dd className="text-foreground">
              {new Date(user.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
          {user.lastLogin && (
            <div>
              <dt className="text-muted-foreground">Last Login</dt>
              <dd className="text-foreground">
                {new Date(user.lastLogin).toLocaleString("en-NG")}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="text-foreground font-mono text-xs">{user._id}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
