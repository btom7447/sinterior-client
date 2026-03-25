"use client";
import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

const skillCategories = [
  { id: "masonry", name: "Masonry & Bricklaying", skills: ["Bricklayer", "Block Layer", "Stone Mason", "Tile Setter", "Plasterer"] },
  { id: "carpentry", name: "Carpentry & Woodwork", skills: ["Carpenter", "Furniture Maker", "Cabinet Maker", "Roof Carpenter", "Wood Finisher"] },
  { id: "electrical", name: "Electrical", skills: ["Electrician", "Solar Installer", "Generator Technician", "CCTV Installer", "Fire Alarm Technician"] },
  { id: "plumbing", name: "Plumbing", skills: ["Plumber", "Pipe Fitter", "Water Tank Installer", "Drainage Specialist", "Pump Technician"] },
  { id: "painting", name: "Painting & Finishing", skills: ["Painter", "POP Installer", "Wallpaper Installer", "Screeder", "Floor Polisher"] },
  { id: "welding", name: "Welding & Metalwork", skills: ["Welder", "Fabricator", "Iron Bender", "Gate Maker", "Burglar Proof Installer"] },
  { id: "roofing", name: "Roofing", skills: ["Roofer", "Aluminum Installer", "Gutter Installer", "Ceiling Installer", "Waterproofing Specialist"] },
  { id: "hvac", name: "HVAC & Cooling", skills: ["AC Technician", "Refrigerator Technician", "Ventilation Installer", "Cold Room Technician"] },
];

const ArtisanDetailsForm = ({ formData, setFormData, onSubmit, onBack, isLoading = false }: ArtisanDetailsFormProps) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const selectedCategory = skillCategories.find((cat) => cat.id === formData.skillCategory);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setIsGettingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({ ...formData, latitude: position.coords.latitude, longitude: position.coords.longitude });
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        if (error.code === error.PERMISSION_DENIED) setLocationError("Please allow location access to continue");
        else if (error.code === error.POSITION_UNAVAILABLE) setLocationError("Location information is unavailable");
        else if (error.code === error.TIMEOUT) setLocationError("Location request timed out");
        else setLocationError("An error occurred getting your location");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
          {skillCategories.map((category) => (
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
          <Label htmlFor="pricePerDay">Daily Rate (₦)</Label>
          <Input id="pricePerDay" type="number" min="1000" step="500" placeholder="15000" value={formData.pricePerDay || ""} onChange={(e) => setFormData({ ...formData, pricePerDay: parseInt(e.target.value) || 0 })} className="py-6 rounded-xl" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">About You</Label>
        <Textarea id="bio" placeholder="Tell clients about your experience, specialties, and what makes you stand out..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="min-h-24 rounded-xl resize-none" maxLength={500} />
        <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/500</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Work Address (Optional)</Label>
        <Input id="address" placeholder="Shop 5, Building Materials Market, Ikeja" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="py-6 rounded-xl" />
      </div>

      <div className="space-y-3 p-4 rounded-xl bg-secondary/50 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Your Location</Label>
            <p className="text-sm text-muted-foreground">Share your location so clients can find you nearby</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleGetLocation} disabled={isGettingLocation} className="rounded-lg">
            {isGettingLocation ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Getting...</>
            ) : (
              <><MapPin className="w-4 h-4 mr-2" />{formData.latitude ? "Update" : "Get"} Location</>
            )}
          </Button>
        </div>
        {formData.latitude && formData.longitude && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <MapPin className="w-4 h-4" />
            <span>Location captured: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</span>
          </div>
        )}
        {locationError && <p className="text-sm text-destructive">{locationError}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 py-6 rounded-xl" disabled={isLoading}>Back</Button>
        <Button type="submit" className="flex-1 py-6 rounded-xl" disabled={isLoading || !formData.latitude}>
          {isLoading ? "Creating account..." : "Complete Registration"}
        </Button>
      </div>

      {!formData.latitude && (
        <p className="text-center text-sm text-muted-foreground">Please share your location to complete registration</p>
      )}
    </form>
  );
};

export default ArtisanDetailsForm;
