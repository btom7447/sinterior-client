"use client";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NairaInput } from "@/components/ui/NairaInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from "@/components/location/LocationPicker";
import { ARTISAN_SKILL_CATEGORIES } from "@/lib/constants";

export interface ArtisanFormData {
  skillCategory: string;
  skill: string;
  experienceYears: number;
  pricePerDay: number;
  bio: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

interface ArtisanDetailsFormProps {
  formData: ArtisanFormData;
  setFormData: (data: ArtisanFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const ArtisanDetailsForm = ({ formData, setFormData, onSubmit, onBack, isLoading = false }: ArtisanDetailsFormProps) => {
  const selectedCategory = ARTISAN_SKILL_CATEGORIES.find((cat) => cat.id === formData.skillCategory);

  const hasLocation = formData.latitude != null && formData.longitude != null;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="skillCategory">Skill Category</Label>
        <select
          id="skillCategory"
          value={formData.skillCategory}
          onChange={(e) => setFormData({ ...formData, skillCategory: e.target.value, skill: "" })}
          className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          <option value="">Select category</option>
          {ARTISAN_SKILL_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div className="space-y-2">
          <Label htmlFor="skill">Specific Skill</Label>
          <select
            id="skill"
            value={formData.skill}
            onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
            className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            <option value="">Select skill</option>
            {selectedCategory.skills.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="experienceYears">Years of Experience</Label>
          <Input id="experienceYears" type="number" min="0" max="50" placeholder="5" value={formData.experienceYears || ""} onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })} className="py-6 rounded-xl" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricePerDay">Daily Rate</Label>
          <NairaInput
            id="pricePerDay"
            value={formData.pricePerDay || null}
            onChange={(v) => setFormData({ ...formData, pricePerDay: v ?? 0 })}
            placeholder="15,000"
            className="py-6 rounded-xl"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">About You</Label>
        <Textarea id="bio" placeholder="Tell clients about your experience, specialties, and what makes you stand out..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="min-h-24 rounded-xl resize-none" maxLength={500} />
        <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/500</p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary" /> Your exact location
        </Label>
        <p className="text-sm text-muted-foreground">
          Search your address, drop a pin with GPS, then drag the pin to fine-tune. Clients use this to find you nearby.
        </p>
        <LocationPicker
          latitude={formData.latitude}
          longitude={formData.longitude}
          address={formData.address}
          onChange={({ latitude, longitude, address }) =>
            setFormData({ ...formData, latitude, longitude, address })
          }
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 py-6 rounded-xl" disabled={isLoading}>
          Back
        </Button>
        <Button type="submit" className="flex-1 py-6 rounded-xl" disabled={isLoading || !hasLocation}>
          {isLoading ? "Creating account..." : "Complete Registration"}
        </Button>
      </div>

      {!hasLocation && (
        <p className="text-center text-sm text-muted-foreground">
          Please pick your location on the map to continue
        </p>
      )}
    </form>
  );
};

export default ArtisanDetailsForm;
