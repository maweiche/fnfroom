"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/shared/data-table";
import { FilterBar } from "@/components/admin/shared/filter-bar";
import { Plus, Edit, Link2, BarChart3, Trash2, CheckCircle, XCircle } from "lucide-react";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  schoolName?: string;
  sport?: string;
  gradYear?: string;
  sanityProfileId?: string | null;
  hasAccount: boolean;
}

// Placeholder data
const mockPlayers: Player[] = [];

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [sanityFilter, setSanityFilter] = useState("all");

  const filteredPlayers = mockPlayers.filter((player) => {
    const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());

    const matchesSport = sportFilter === "all" || player.sport === sportFilter;

    const matchesSanity =
      sanityFilter === "all" ||
      (sanityFilter === "linked" && player.sanityProfileId !== null) ||
      (sanityFilter === "unlinked" && player.sanityProfileId === null);

    return matchesSearch && matchesSport && matchesSanity;
  });

  const columns: Column<Player>[] = [
    {
      key: "firstName",
      label: "Name",
      sortable: true,
      render: (value, row) => (
        <span className="font-sans font-medium text-foreground">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      key: "schoolName",
      label: "School",
      sortable: true,
      render: (value) => (
        <span className="font-sans text-foreground">{value || "—"}</span>
      ),
    },
    {
      key: "sport",
      label: "Sport",
      render: (value) =>
        value ? (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary">
            {value}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "gradYear",
      label: "Grad Year",
      sortable: true,
      render: (value) => value || "—",
    },
    {
      key: "sanityProfileId",
      label: "Sanity Link",
      render: (value) =>
        value ? (
          <CheckCircle className="w-4 h-4 text-success" />
        ) : (
          <XCircle className="w-4 h-4 text-muted" />
        ),
    },
    {
      key: "hasAccount",
      label: "Has Account",
      render: (value) =>
        value ? (
          <CheckCircle className="w-4 h-4 text-success" />
        ) : (
          <XCircle className="w-4 h-4 text-muted" />
        ),
    },
    {
      key: "id",
      label: "Actions",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/players/${value}`}>
            <button
              className="p-1 hover:bg-muted/10 rounded"
              title="Edit player"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit className="w-4 h-4 text-foreground" />
            </button>
          </Link>
          <button
            className="p-1 hover:bg-primary/10 rounded"
            title="Link to Sanity"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Link to Sanity
            }}
          >
            <Link2 className="w-4 h-4 text-primary" />
          </button>
          <button
            className="p-1 hover:bg-info/10 rounded"
            title="View stats"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: View stats
            }}
          >
            <BarChart3 className="w-4 h-4 text-info" />
          </button>
          <button
            className="p-1 hover:bg-destructive/10 rounded"
            title="Delete player"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Delete player
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
            Players
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage player profiles and data
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Player
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name..."
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
            label: "Sanity Profile",
            value: sanityFilter,
            onChange: setSanityFilter,
            options: [
              { value: "all", label: "All Players" },
              { value: "linked", label: "Linked" },
              { value: "unlinked", label: "Not Linked" },
            ],
          },
        ]}
      />

      {/* Players table */}
      <DataTable data={filteredPlayers} columns={columns} />
    </div>
  );
}
