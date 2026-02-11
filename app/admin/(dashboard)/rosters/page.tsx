"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/shared/data-table";
import { FilterBar } from "@/components/admin/shared/filter-bar";
import { Plus, Edit, Trash2 } from "lucide-react";

interface RosterEntry {
  id: string;
  playerName: string;
  schoolName: string;
  sport: string;
  season: string;
  jerseyNumber?: string;
  position?: string;
  grade?: string;
  status: string;
}

// Placeholder data
const mockRosters: RosterEntry[] = [];

export default function RostersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("2024-25");

  const filteredRosters = mockRosters.filter((roster) => {
    const matchesSearch =
      roster.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roster.schoolName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSport = sportFilter === "all" || roster.sport === sportFilter;
    const matchesSeason = roster.season === seasonFilter;

    return matchesSearch && matchesSport && matchesSeason;
  });

  const columns: Column<RosterEntry>[] = [
    {
      key: "schoolName",
      label: "School",
      sortable: true,
      render: (value) => (
        <span className="font-sans font-medium text-foreground">{value}</span>
      ),
    },
    {
      key: "playerName",
      label: "Player",
      sortable: true,
      render: (value) => (
        <span className="font-sans text-foreground">{value}</span>
      ),
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
      key: "jerseyNumber",
      label: "Jersey",
      render: (value) => value ? `#${value}` : "—",
    },
    {
      key: "position",
      label: "Position",
      render: (value) => value || "—",
    },
    {
      key: "grade",
      label: "Grade",
      render: (value) => value || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            value === "ACTIVE"
              ? "bg-success/20 text-success"
              : "bg-muted/20 text-muted"
          }`}
        >
          {value}
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
            title="Edit roster entry"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Edit roster
            }}
          >
            <Edit className="w-4 h-4 text-foreground" />
          </button>
          <button
            className="p-1 hover:bg-destructive/10 rounded"
            title="Delete roster entry"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Delete roster
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
            Rosters
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage team rosters by school and sport
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Roster Entry
        </Button>
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
              { value: "basketball", label: "Basketball" },
              { value: "football", label: "Football" },
              { value: "lacrosse", label: "Lacrosse" },
            ],
          },
          {
            label: "Season",
            value: seasonFilter,
            onChange: setSeasonFilter,
            options: [
              { value: "2024-25", label: "2024-25" },
              { value: "2023-24", label: "2023-24" },
              { value: "2022-23", label: "2022-23" },
            ],
          },
        ]}
      />

      {/* Rosters table */}
      <DataTable data={filteredRosters} columns={columns} />
    </div>
  );
}
