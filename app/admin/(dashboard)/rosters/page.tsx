"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable, type Column } from "@/components/admin/shared/data-table";
import { FilterBar } from "@/components/admin/shared/filter-bar";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface RosterEntry {
  id: string;
  playerName: string;
  schoolName: string;
  sport: string;
  season: string;
  jerseyNumber: string | null;
  position: string | null;
  grade: string | null;
  status: string;
}

function getAuthToken() {
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

export default function RostersPage() {
  const [rosters, setRosters] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("2025-26");

  const fetchRosters = useCallback(async () => {
    setLoading(true);
    const token = getAuthToken();

    const params = new URLSearchParams({ limit: "200" });
    if (sportFilter !== "all") params.set("sport", sportFilter);
    if (seasonFilter !== "all") params.set("season", seasonFilter);

    try {
      const res = await fetch(`/api/admin/rosters?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch rosters");

      const json = await res.json();
      const entries: RosterEntry[] = (json.data || []).map((r: any) => ({
        id: r.id,
        playerName: `${r.player.firstName} ${r.player.lastName}`,
        schoolName: r.school.name,
        sport: r.sport,
        season: r.season,
        jerseyNumber: r.jerseyNumber,
        position: r.position || r.player.position,
        grade: r.grade,
        status: r.status,
      }));

      setRosters(entries);
      setTotal(json.pagination?.total || entries.length);
    } catch (err) {
      console.error("Failed to load rosters:", err);
    } finally {
      setLoading(false);
    }
  }, [sportFilter, seasonFilter]);

  useEffect(() => {
    fetchRosters();
  }, [fetchRosters]);

  const filteredRosters = searchQuery
    ? rosters.filter(
        (r) =>
          r.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rosters;

  const sportColor: Record<string, string> = {
    BASKETBALL: "bg-orange-500/20 text-orange-400",
    FOOTBALL: "bg-green-500/20 text-green-400",
    LACROSSE: "bg-blue-500/20 text-blue-400",
  };

  const columns: Column<RosterEntry>[] = [
    {
      key: "schoolName",
      label: "School",
      sortable: true,
      render: (value) => (
        <span className="font-medium text-foreground">{value}</span>
      ),
    },
    {
      key: "playerName",
      label: "Player",
      sortable: true,
      render: (value) => <span className="text-foreground">{value}</span>,
    },
    {
      key: "sport",
      label: "Sport",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            sportColor[value] || "bg-muted/20 text-muted"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "jerseyNumber",
      label: "Jersey",
      render: (value) =>
        value ? (
          <span className="font-mono text-xs">{`#${value}`}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: "position",
      label: "Position",
      render: (value) =>
        value ? (
          <span className="text-xs">{value}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: "grade",
      label: "Grade",
      render: (value) =>
        value ? (
          <span className="text-xs font-medium">{value}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            value === "ACTIVE"
              ? "bg-green-500/20 text-green-400"
              : "bg-muted/20 text-muted"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Rosters
          </h1>
          <p className="text-sm text-muted mt-1">
            {loading
              ? "Loading rosters..."
              : `${total} roster entries`}
          </p>
        </div>
        <Link
          href="/admin/roster-upload"
          className="bg-[#E6BC6A] text-[#1a1d29] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#E6BC6A]/90 transition-colors"
        >
          Upload Roster
        </Link>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by school or player..."
        filters={[
          {
            label: "Sport",
            value: sportFilter,
            onChange: setSportFilter,
            options: [
              { value: "all", label: "All Sports" },
              { value: "BASKETBALL", label: "Basketball" },
              { value: "FOOTBALL", label: "Football" },
              { value: "LACROSSE", label: "Lacrosse" },
            ],
          },
          {
            label: "Season",
            value: seasonFilter,
            onChange: setSeasonFilter,
            options: [
              { value: "all", label: "All Seasons" },
              { value: "2025-26", label: "2025-26" },
              { value: "2024-25", label: "2024-25" },
              { value: "2023-24", label: "2023-24" },
            ],
          },
        ]}
      />

      {/* Table */}
      {loading ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#E6BC6A] mx-auto mb-3 animate-spin" />
          <p className="text-sm text-muted">Loading rosters...</p>
        </div>
      ) : filteredRosters.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-foreground font-medium mb-1">No roster entries found</p>
          <p className="text-sm text-muted">
            {searchQuery
              ? "Try a different search term"
              : "Upload a roster to get started"}
          </p>
        </div>
      ) : (
        <DataTable data={filteredRosters} columns={columns} />
      )}
    </div>
  );
}
