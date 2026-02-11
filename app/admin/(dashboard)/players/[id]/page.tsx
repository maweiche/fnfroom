"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlayerForm } from "@/components/admin/players/player-form";
import { DataTable, type Column } from "@/components/admin/shared/data-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Link2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

// Mock data - replace with API call
const mockPlayer = {
  id: "123",
  firstName: "John",
  lastName: "Doe",
  schoolName: "Example High School",
  position: "PG",
  isMaxPrepsPlayer: true,
  sanityProfileId: null,
  stats: [],
  offers: [],
};

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;

  const [player] = useState(mockPlayer);
  const [activeTab, setActiveTab] = useState<"info" | "stats" | "offers">(
    "info"
  );

  const handleSavePlayer = async (data: any) => {
    console.log("Saving player:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleLinkToSanity = () => {
    // TODO: Open Sanity profile selector
    console.log("Link to Sanity");
  };

  const statsColumns: Column<any>[] = [
    { key: "sport", label: "Sport", sortable: true },
    { key: "season", label: "Season", sortable: true },
    { key: "statType", label: "Stat Type", sortable: true },
    { key: "value", label: "Value", sortable: true },
    { key: "gamesPlayed", label: "Games", sortable: true },
  ];

  const offersColumns: Column<any>[] = [
    { key: "collegeName", label: "College", sortable: true },
    { key: "collegeDivision", label: "Division", sortable: true },
    { key: "offerType", label: "Type", sortable: true },
    { key: "sport", label: "Sport", sortable: true },
    {
      key: "verified",
      label: "Verified",
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
      render: (value, row) =>
        !row.verified && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Verify offer
            }}
          >
            Verify
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin/players"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Players
      </Link>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {player.firstName} {player.lastName}
          </h1>
          <p className="text-sm text-muted mt-1">{player.schoolName}</p>
        </div>
        <div className="flex gap-2">
          {!player.sanityProfileId && (
            <Button variant="outline" className="gap-2" onClick={handleLinkToSanity}>
              <Link2 className="w-4 h-4" />
              Link to Sanity
            </Button>
          )}
          {player.sanityProfileId && (
            <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-md">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm text-success">Linked to Sanity</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "info"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Player Info
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "stats"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Stats ({player.stats.length})
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "offers"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            College Offers ({player.offers.length})
          </button>
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "info" && (
        <div className="bg-card rounded-lg border border-border p-6 max-w-3xl">
          <PlayerForm
            initialData={player}
            onSubmit={handleSavePlayer}
            isMaxPrepsPlayer={player.isMaxPrepsPlayer}
          />
        </div>
      )}

      {activeTab === "stats" && (
        <div>
          {player.stats.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <p className="text-muted">No statistics available for this player</p>
            </div>
          ) : (
            <DataTable data={player.stats} columns={statsColumns} />
          )}
        </div>
      )}

      {activeTab === "offers" && (
        <div>
          {player.offers.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <p className="text-muted">No college offers for this player</p>
            </div>
          ) : (
            <DataTable data={player.offers} columns={offersColumns} />
          )}
        </div>
      )}
    </div>
  );
}
