"use client";
import { useState, useRef } from "react";
import { Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AvatarUploadProps {
  avatarFile: File | null;
  avatarPreview: string | null;
  onFileSelect: (file: File | null, preview: string | null) => void;
}

const AvatarUpload = ({ avatarFile, avatarPreview, onFileSelect }: AvatarUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onFileSelect(null, null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    onFileSelect(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <Label>Profile Photo (Optional)</Label>
      <div className="flex items-center gap-4">
        <div
          className={`relative w-20 h-20 rounded-full border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-lg">
            <Camera className="w-4 h-4 mr-2" />
            {avatarFile ? "Change Photo" : "Upload Photo"}
          </Button>
          {avatarFile && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} className="text-muted-foreground hover:text-destructive ml-2">
              Remove
            </Button>
          )}
          <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5MB.</p>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
