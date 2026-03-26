"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Edit2, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiPatch } from "@/lib/apiClient";
import { toast } from "sonner";

const DashboardProfile = () => {
  const { profile, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPatch("/profiles/me", {
        fullName: form.full_name,
        phone: form.phone,
        bio: form.bio,
      });
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Profile Information</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your personal information and preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {profile?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
              <Camera className="w-3.5 h-3.5" strokeWidth={1} />
            </button>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">{profile?.full_name}</h2>
            <span className="badge-role capitalize mt-1">{profile?.role}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto rounded-xl gap-1.5"
            onClick={() => setEditing(!editing)}
          >
            <Edit2 className="w-4 h-4" strokeWidth={1} />
            {editing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <h3 className="font-display font-bold text-foreground mb-4">Personal Details</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Full Name</Label>
            {editing ? (
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="mt-1.5"
              />
            ) : (
              <p className="mt-1.5 text-foreground font-medium">{profile?.full_name || "—"}</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
            <p className="mt-1.5 text-foreground font-medium">{user?.email || "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Phone</Label>
            {editing ? (
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1.5"
              />
            ) : (
              <p className="mt-1.5 text-foreground font-medium">{profile?.phone || "—"}</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Role</Label>
            <p className="mt-1.5 text-foreground font-medium capitalize">{profile?.role || "client"}</p>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Bio</Label>
            {editing ? (
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="mt-1.5"
                rows={3}
              />
            ) : (
              <p className="mt-1.5 text-foreground font-medium">{profile?.bio || "No bio added yet."}</p>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-1.5">
              <Save className="w-4 h-4" strokeWidth={1} />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardProfile;
