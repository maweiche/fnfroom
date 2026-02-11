import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  GraduationCap,
  Trophy,
  Calendar,
  School,
  Plus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Placeholder data - will be replaced with actual API calls
async function getDashboardStats() {
  return {
    totalUsers: 0,
    usersByRole: {
      ADMIN: 0,
      WRITER: 0,
      COACH: 0,
      PLAYER: 0,
      FAN: 0,
    },
    pendingClaims: 0,
    unverifiedOffers: 0,
    totalPlayers: 0,
    totalGames: 0,
    totalSchools: 0,
  };
}

async function getRecentActivity() {
  return [];
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentActivity = await getRecentActivity();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted mt-1">
            Overview of your admin panel
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Users */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold text-secondary">
                Total Users
              </p>
              <p className="text-3xl font-display font-bold text-foreground mt-2 tabular-nums">
                {stats.totalUsers}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-xs">
            <div>
              <span className="text-muted">Admins:</span>{" "}
              <span className="font-mono font-semibold">{stats.usersByRole.ADMIN}</span>
            </div>
            <div>
              <span className="text-muted">Writers:</span>{" "}
              <span className="font-mono font-semibold">{stats.usersByRole.WRITER}</span>
            </div>
            <div>
              <span className="text-muted">Coaches:</span>{" "}
              <span className="font-mono font-semibold">{stats.usersByRole.COACH}</span>
            </div>
          </div>
        </div>

        {/* Pending Claims */}
        <Link
          href="/admin/players/claims"
          className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold text-secondary">
                Pending Claims
              </p>
              <p className="text-3xl font-display font-bold text-foreground mt-2 tabular-nums">
                {stats.pendingClaims}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-warning" />
            </div>
          </div>
          <p className="text-xs text-muted mt-4">
            Click to review player claim requests
          </p>
        </Link>

        {/* Unverified Offers */}
        <Link
          href="/admin/offers"
          className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold text-secondary">
                Unverified Offers
              </p>
              <p className="text-3xl font-display font-bold text-foreground mt-2 tabular-nums">
                {stats.unverifiedOffers}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-info/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-info" />
            </div>
          </div>
          <p className="text-xs text-muted mt-4">
            Click to verify college offers
          </p>
        </Link>

        {/* Total Players */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold text-secondary">
                Total Players
              </p>
              <p className="text-3xl font-display font-bold text-foreground mt-2 tabular-nums">
                {stats.totalPlayers}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-xs">
            <div>
              <span className="text-muted">Games:</span>{" "}
              <span className="font-mono font-semibold">{stats.totalGames}</span>
            </div>
            <div>
              <span className="text-muted">Schools:</span>{" "}
              <span className="font-mono font-semibold">{stats.totalSchools}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-display font-bold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/users/create">
            <Button className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Create User
            </Button>
          </Link>
          <Link href="/admin/players/claims">
            <Button variant="outline" className="w-full gap-2">
              <CheckCircle className="w-4 h-4" />
              Review Claims
            </Button>
          </Link>
          <Link href="/admin/offers">
            <Button variant="outline" className="w-full gap-2">
              <AlertCircle className="w-4 h-4" />
              Verify Offers
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-display font-bold text-foreground mb-4">
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">
            No recent activity to display
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
