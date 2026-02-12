"use client";

import { useState, useEffect, useCallback } from "react";
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

function getAuthToken() {
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const token = getAuthToken();
    const params = new URLSearchParams();
    if (roleFilter !== "all") params.set("role", roleFilter);
    if (verifiedFilter !== "all") params.set("verified", verifiedFilter === "verified" ? "true" : "false");
    if (searchQuery) params.set("search", searchQuery);

    try {
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, verifiedFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchUsers, searchQuery]);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const filteredUsers = users;

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
              handleDelete(value);
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
      {loading ? (
        <div className="text-center py-12 text-muted">Loading users...</div>
      ) : (
        <DataTable data={filteredUsers} columns={columns} />
      )}
    </div>
  );
}
