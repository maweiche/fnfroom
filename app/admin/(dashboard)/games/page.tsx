"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/shared/data-table";
import { FilterBar } from "@/components/admin/shared/filter-bar";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";

interface Game {
  id: string;
  date: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  source?: string;
  gameTime?: string;
  isConference?: boolean;
}

function getAuthToken() {
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchGames() {
      try {
        const token = getAuthToken();
        const res = await fetch("/api/admin/games", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setGames(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch games:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.awayTeam.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSport =
      sportFilter === "all" ||
      game.sport.toLowerCase() === sportFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      game.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesSport && matchesStatus;
  });

  const columns: Column<Game>[] = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "sport",
      label: "Sport",
      render: (value) => (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary">
          {value}
        </span>
      ),
    },
    {
      key: "homeTeam",
      label: "Home Team",
      sortable: true,
      render: (value) => (
        <span className="font-sans font-medium text-foreground">{value}</span>
      ),
    },
    {
      key: "awayTeam",
      label: "Away Team",
      sortable: true,
      render: (value) => (
        <span className="font-sans font-medium text-foreground">{value}</span>
      ),
    },
    {
      key: "homeScore",
      label: "Score",
      render: (value, row) =>
        row.homeScore !== undefined && row.awayScore !== undefined
          ? `${row.homeScore} - ${row.awayScore}`
          : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            value === "Final"
              ? "bg-success/20 text-success"
              : value === "Live"
              ? "bg-warning/20 text-warning"
              : "bg-muted/20 text-muted"
          }`}
        >
          {value || "—"}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (value) => (
        <div className="flex items-center gap-2">
          <button
            className="p-1 hover:bg-muted/10 rounded"
            title="Edit game"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Edit className="w-4 h-4 text-foreground" />
          </button>
          <button
            className="p-1 hover:bg-destructive/10 rounded"
            title="Delete game"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Games
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage game schedules and results
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Game
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by team name..."
        filters={[
          {
            label: "Sport",
            value: sportFilter,
            onChange: setSportFilter,
            options: [
              { value: "all", label: "All Sports" },
              { value: "basketball", label: "Basketball" },
              { value: "football", label: "Football" },
              { value: "lacrosse", label: "Lacrosse" },
            ],
          },
          {
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "All Status" },
              { value: "scheduled", label: "Scheduled" },
              { value: "live", label: "Live" },
              { value: "final", label: "Final" },
            ],
          },
        ]}
      />

      {/* Games table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-muted animate-spin" />
        </div>
      ) : (
        <DataTable data={filteredGames} columns={columns} />
      )}
    </div>
  );
}
