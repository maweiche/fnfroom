"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Trophy,
  Calendar,
  BarChart3,
  School,
  GraduationCap,
  FileText,
  Upload,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Player Claims",
    href: "/admin/players/claims",
    icon: UserCheck,
  },
  {
    name: "Players",
    href: "/admin/players",
    icon: Trophy,
  },
  {
    name: "Rosters",
    href: "/admin/rosters",
    icon: Users,
  },
  {
    name: "Games",
    href: "/admin/games",
    icon: Calendar,
  },
  {
    name: "Schedule Upload",
    href: "/admin/schedules",
    icon: Upload,
  },
  {
    name: "Roster Upload",
    href: "/admin/roster-upload",
    icon: Upload,
  },
  {
    name: "Stats",
    href: "/admin/stats",
    icon: BarChart3,
  },
  {
    name: "Schools",
    href: "/admin/schools",
    icon: School,
  },
  {
    name: "College Offers",
    href: "/admin/offers",
    icon: GraduationCap,
  },
  {
    name: "Audit Log",
    href: "/admin/audit",
    icon: FileText,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-[#1a1d29] border-r border-[#E6BC6A]/20 hidden md:block">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-[#E6BC6A]/20">
          <Link href="/admin/dashboard">
            <h1 className="text-xl font-display font-bold text-[#E6BC6A]">
              FNFR Admin
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#E6BC6A]/20 text-[#E6BC6A]"
                        : "text-[#F7EED9]/70 hover:bg-[#E6BC6A]/10 hover:text-[#E6BC6A]"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {item.badge !== undefined && (
                      <span className="ml-auto bg-[#E6BC6A] text-[#1a1d29] text-xs font-bold px-2 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6BC6A]/20">
          <p className="text-xs text-[#F7EED9]/50 text-center">
            Friday Night Film Room
          </p>
        </div>
      </div>
    </aside>
  );
}
