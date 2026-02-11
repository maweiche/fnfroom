"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PlayerFormData {
  firstName: string;
  lastName: string;
  schoolName?: string;
  position?: string;
  bio?: string;
  heightFeet?: number;
  heightInches?: number;
  weight?: number;
  jerseyNumber?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialHudl?: string;
}

interface PlayerFormProps {
  initialData?: PlayerFormData;
  onSubmit: (data: PlayerFormData) => Promise<void>;
  isMaxPrepsPlayer?: boolean;
}

export function PlayerForm({
  initialData,
  onSubmit,
  isMaxPrepsPlayer = false,
}: PlayerFormProps) {
  const [formData, setFormData] = useState<PlayerFormData>(
    initialData || {
      firstName: "",
      lastName: "",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName || !formData.lastName) {
      setError("First name and last name are required");
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof PlayerFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {isMaxPrepsPlayer && (
        <div className="bg-info/10 border border-info/20 rounded-md p-4">
          <p className="text-sm text-info">
            This player was imported from MaxPreps. Basic info (name, school)
            cannot be edited.
          </p>
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            First Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            disabled={isMaxPrepsPlayer}
            className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Last Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            disabled={isMaxPrepsPlayer}
            className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          School
        </label>
        <input
          type="text"
          value={formData.schoolName || ""}
          onChange={(e) => updateField("schoolName", e.target.value)}
          disabled={isMaxPrepsPlayer}
          className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Position
        </label>
        <input
          type="text"
          value={formData.position || ""}
          onChange={(e) => updateField("position", e.target.value)}
          className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Physical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Height (Feet)
          </label>
          <input
            type="number"
            min="0"
            max="8"
            value={formData.heightFeet || ""}
            onChange={(e) =>
              updateField("heightFeet", parseInt(e.target.value) || undefined)
            }
            className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Height (Inches)
          </label>
          <input
            type="number"
            min="0"
            max="11"
            value={formData.heightInches || ""}
            onChange={(e) =>
              updateField("heightInches", parseInt(e.target.value) || undefined)
            }
            className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Weight (lbs)
          </label>
          <input
            type="number"
            min="0"
            value={formData.weight || ""}
            onChange={(e) =>
              updateField("weight", parseInt(e.target.value) || undefined)
            }
            className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Jersey Number
        </label>
        <input
          type="text"
          value={formData.jerseyNumber || ""}
          onChange={(e) => updateField("jerseyNumber", e.target.value)}
          className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio || ""}
          onChange={(e) => updateField("bio", e.target.value)}
          rows={4}
          className="w-full px-4 py-2 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Social Media</h3>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Twitter/X Handle
          </label>
          <input
            type="text"
            value={formData.socialTwitter || ""}
            onChange={(e) => updateField("socialTwitter", e.target.value)}
            placeholder="@username"
            className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Instagram Handle
          </label>
          <input
            type="text"
            value={formData.socialInstagram || ""}
            onChange={(e) => updateField("socialInstagram", e.target.value)}
            placeholder="@username"
            className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Hudl Profile URL
          </label>
          <input
            type="url"
            value={formData.socialHudl || ""}
            onChange={(e) => updateField("socialHudl", e.target.value)}
            placeholder="https://hudl.com/profile/..."
            className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : "Save Player"}
        </Button>
      </div>
    </form>
  );
}
