"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface UserFormProps {
  initialData?: {
    email: string;
    name: string;
    role: string;
    schoolName?: string;
    primarySport?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
}

export function UserForm({
  initialData,
  onSubmit,
  submitLabel = "Create User",
}: UserFormProps) {
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(initialData?.name || "");
  const [role, setRole] = useState(initialData?.role || "FAN");
  const [schoolName, setSchoolName] = useState(initialData?.schoolName || "");
  const [primarySport, setPrimarySport] = useState(
    initialData?.primarySport || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !name) {
      setError("Email and name are required");
      return;
    }

    if (!initialData && !password) {
      setError("Password is required for new users");
      return;
    }

    if (password && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (role === "COACH" && !schoolName) {
      setError("School name is required for coaches");
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        email,
        password: password || undefined,
        name,
        role,
        schoolName: schoolName || undefined,
        primarySport: primarySport || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Email <span className="text-destructive">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required
          disabled={!!initialData}
        />
      </div>

      {/* Password */}
      {!initialData && (
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Password <span className="text-destructive">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            minLength={8}
            required
          />
          <p className="text-xs text-muted mt-1">
            Must be at least 8 characters
          </p>
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Name <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />
      </div>

      {/* Role */}
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Role <span className="text-destructive">*</span>
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        >
          <option value="FAN">Fan</option>
          <option value="PLAYER">Player</option>
          <option value="COACH">Coach</option>
          <option value="WRITER">Writer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Coach-specific fields */}
      {role === "COACH" && (
        <>
          <div>
            <label
              htmlFor="schoolName"
              className="block text-sm font-medium text-foreground mb-2"
            >
              School Name <span className="text-destructive">*</span>
            </label>
            <input
              id="schoolName"
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="primarySport"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Primary Sport
            </label>
            <select
              id="primarySport"
              value={primarySport}
              onChange={(e) => setPrimarySport(e.target.value)}
              className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a sport</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="lacrosse">Lacrosse</option>
            </select>
          </div>
        </>
      )}

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
