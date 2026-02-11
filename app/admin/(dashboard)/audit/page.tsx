"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/shared/data-table";
import { FilterBar } from "@/components/admin/shared/filter-bar";

interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  notes?: string;
  createdAt: string;
}

// Placeholder data
const mockLogs: AuditLog[] = [];

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesTargetType =
      targetTypeFilter === "all" || log.targetType === targetTypeFilter;

    return matchesSearch && matchesAction && matchesTargetType;
  });

  const columns: Column<AuditLog>[] = [
    {
      key: "createdAt",
      label: "Timestamp",
      sortable: true,
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      key: "adminEmail",
      label: "Admin",
      sortable: true,
      render: (value) => (
        <span className="font-sans text-foreground">{value}</span>
      ),
    },
    {
      key: "action",
      label: "Action",
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary">
          {value.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "targetType",
      label: "Target",
      render: (value) => (
        <span className="font-sans text-foreground">{value}</span>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (value) => (
        <span className="font-sans text-muted text-xs">
          {value || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Audit Log
        </h1>
        <p className="text-sm text-muted mt-1">
          Track all admin actions and changes
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by admin email or notes..."
        filters={[
          {
            label: "Action",
            value: actionFilter,
            onChange: setActionFilter,
            options: [
              { value: "all", label: "All Actions" },
              { value: "USER_CREATED", label: "User Created" },
              { value: "USER_UPDATED", label: "User Updated" },
              { value: "USER_DELETED", label: "User Deleted" },
              {
                value: "PLAYER_CLAIM_APPROVED",
                label: "Claim Approved",
              },
              {
                value: "PLAYER_CLAIM_REJECTED",
                label: "Claim Rejected",
              },
              { value: "OFFER_VERIFIED", label: "Offer Verified" },
              { value: "GAME_CREATED", label: "Game Created" },
              { value: "ROSTER_UPDATED", label: "Roster Updated" },
            ],
          },
          {
            label: "Target Type",
            value: targetTypeFilter,
            onChange: setTargetTypeFilter,
            options: [
              { value: "all", label: "All Types" },
              { value: "USER", label: "User" },
              { value: "PLAYER", label: "Player" },
              { value: "GAME", label: "Game" },
              { value: "ROSTER", label: "Roster" },
              { value: "SCHOOL", label: "School" },
            ],
          },
        ]}
      />

      {/* Audit log table */}
      <DataTable data={filteredLogs} columns={columns} />
    </div>
  );
}
