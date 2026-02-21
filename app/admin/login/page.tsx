"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if user is admin
      if (data.user.role !== "ADMIN") {
        throw new Error("Access denied. Admin privileges required.");
      }

      // Set cookie for middleware auth
      document.cookie = `auth_token=${data.token}; path=/; max-age=${
        7 * 24 * 60 * 60
      }`;

      // Redirect to dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            FNFR Admin
          </h1>
          <p className="text-sm text-muted mt-2">
            Sign in to access the admin panel
          </p>
        </div>

        {/* Login form */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-4 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 px-4 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted mt-6">
          Friday Night Film Room Admin Panel
        </p>
      </div>
    </div>
  );
}
