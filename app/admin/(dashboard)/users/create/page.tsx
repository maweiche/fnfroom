"use client";

import { useRouter } from "next/navigation";
import { UserForm } from "@/components/admin/users/user-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateUserPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
    const token = match ? match[1] : null;

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || "Failed to create user");
    }

    router.push("/admin/users");
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back button */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Create User
        </h1>
        <p className="text-sm text-muted mt-1">
          Add a new user account to the system
        </p>
      </div>

      {/* Form */}
      <div className="bg-card rounded-lg border border-border p-6">
        <UserForm onSubmit={handleSubmit} submitLabel="Create User" />
      </div>
    </div>
  );
}
