"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  user: {
    email: string;
    name: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    // Clear auth cookie
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        {/* Mobile menu button - future enhancement */}
        <div className="md:hidden">
          <h1 className="text-lg font-display font-bold text-primary">
            FNFR Admin
          </h1>
        </div>

        {/* User info */}
        <div className="flex-1 flex items-center justify-end gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
