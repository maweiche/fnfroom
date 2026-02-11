"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/shared/data-table";
import { FilterBar } from "@/components/admin/shared/filter-bar";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolName?: string;
  verifiedAt?: string | null;
  createdAt: string;
}

// Placeholder data - will be replaced with actual API calls
const mockUsers: User[] = [];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    const matchesVerified =
      verifiedFilter === "all" ||
      (verifiedFilter === "verified" && user.verifiedAt !== null) ||
      (verifiedFilter === "unverified" && user.verifiedAt === null);

    return matchesSearch && matchesRole && matchesVerified;
  });

  const columns: Column<User>[] = [
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value) => (
        <span className="font-sans text-foreground">{value}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (value) => (
        <span className="font-sans font-medium text-foreground">{value}</span>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary">
          {value}
        </span>
      ),
    },
    {
      key: "schoolName",
      label: "School",
      render: (value) => (
        <span className="font-sans text-foreground">{value || "—"}</span>
      ),
    },
    {
      key: "verifiedAt",
      label: "Verified",
      render: (value) =>
        value ? (
          <CheckCircle className="w-4 h-4 text-success" />
        ) : (
          <XCircle className="w-4 h-4 text-muted" />
        ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "id",
      label: "Actions",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            className="p-1 hover:bg-muted/10 rounded"
            title="Edit user"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Edit user
            }}
          >
            <Edit className="w-4 h-4 text-foreground" />
          </button>
          <button
            className="p-1 hover:bg-destructive/10 rounded"
            title="Delete user"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Delete user
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
            Users
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Link href="/admin/users/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create User
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name or email..."
        filters={[
          {
            label: "Role",
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: "all", label: "All Roles" },
              { value: "ADMIN", label: "Admin" },
              { value: "WRITER", label: "Writer" },
              { value: "COACH", label: "Coach" },
              { value: "PLAYER", label: "Player" },
              { value: "FAN", label: "Fan" },
            ],
          },
          {
            label: "Status",
            value: verifiedFilter,
            onChange: setVerifiedFilter,
            options: [
              { value: "all", label: "All Status" },
              { value: "verified", label: "Verified" },
              { value: "unverified", label: "Unverified" },
            ],
          },
        ]}
      />

      {/* Users table */}
      <DataTable data={filteredUsers} columns={columns} />
    </div>
  );
}
