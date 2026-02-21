"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/shared/data-table";
import { FilterBar } from "@/components/admin/shared/filter-bar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";

interface Game {
  id: string;
  date: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
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

  // Edit modal state
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [editHomeScore, setEditHomeScore] = useState("");
  const [editAwayScore, setEditAwayScore] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editGameTime, setEditGameTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetchGames();
  }, []);

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

  function openEditModal(game: Game) {
    setEditGame(game);
    setEditHomeScore(game.homeScore != null ? String(game.homeScore) : "");
    setEditAwayScore(game.awayScore != null ? String(game.awayScore) : "");
    setEditStatus(game.status || "Scheduled");
    setEditGameTime(game.gameTime || "");
    setSaveError("");
  }

  async function handleSave() {
    if (!editGame) return;
    setSaving(true);
    setSaveError("");

    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/games/${editGame.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeScore: editHomeScore === "" ? null : editHomeScore,
          awayScore: editAwayScore === "" ? null : editAwayScore,
          status: editStatus,
          gameTime: editGameTime,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setSaveError(json.error || "Failed to save");
        return;
      }

      const json = await res.json();
      // Update the game in local state
      setGames((prev) =>
        prev.map((g) => (g.id === editGame.id ? json.data : g))
      );
      setEditGame(null);
    } catch (err) {
      setSaveError("Network error");
    } finally {
      setSaving(false);
    }
  }

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
      render: (value) => {
        const d = new Date(value);
        return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
      },
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
        row.homeScore != null && row.awayScore != null
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
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <button
            className="p-1 hover:bg-muted/10 rounded"
            title="Edit game"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(row);
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

      {/* Edit Game Modal */}
      <Dialog
        open={editGame !== null}
        onOpenChange={(open) => !open && setEditGame(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>

          {editGame && (
            <div className="space-y-4 py-2">
              {/* Matchup display */}
              <div className="text-center text-sm text-muted">
                {new Date(editGame.date).toLocaleDateString("en-US", {
                  timeZone: "UTC",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                &middot; {editGame.sport}
              </div>

              {/* Score inputs */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wide">
                    {editGame.homeTeam}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editHomeScore}
                    onChange={(e) => setEditHomeScore(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-center text-lg font-mono tabular-nums text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <span className="text-muted text-lg pt-5">—</span>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wide">
                    {editGame.awayTeam}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editAwayScore}
                    onChange={(e) => setEditAwayScore(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-center text-lg font-mono tabular-nums text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-secondary uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Live">Live</option>
                  <option value="Final">Final</option>
                  <option value="Postponed">Postponed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Game Time */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-secondary uppercase tracking-wide">
                  Game Time
                </label>
                <input
                  type="text"
                  value={editGameTime}
                  onChange={(e) => setEditGameTime(e.target.value)}
                  placeholder="e.g. 7:00 PM"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {saveError && (
                <p className="text-sm text-destructive">{saveError}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditGame(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
