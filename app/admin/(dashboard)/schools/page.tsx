"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/shared/data-table";
import { FilterBar } from "@/components/admin/shared/filter-bar";
import { Plus, Edit, Trash2 } from "lucide-react";

interface School {
  id: string;
  name: string;
  city?: string;
  classification?: string;
  conference?: string;
  createdAt: string;
}

// Placeholder data
const mockSchools: School[] = [];

export default function SchoolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("all");

  const filteredSchools = mockSchools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClassification =
      classificationFilter === "all" ||
      school.classification === classificationFilter;

    return matchesSearch && matchesClassification;
  });

  const columns: Column<School>[] = [
    {
      key: "name",
      label: "School Name",
      sortable: true,
      render: (value) => (
        <span className="font-sans font-medium text-foreground">{value}</span>
      ),
    },
    {
      key: "city",
      label: "City",
      sortable: true,
      render: (value) => (
        <span className="font-sans text-foreground">{value || "—"}</span>
      ),
    },
    {
      key: "classification",
      label: "Classification",
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
      key: "conference",
      label: "Conference",
      render: (value) => (
        <span className="font-sans text-foreground">{value || "—"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Added",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "id",
      label: "Actions",
      render: (value) => (
        <div className="flex items-center gap-2">
          <button
            className="p-1 hover:bg-muted/10 rounded"
            title="Edit school"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Edit school
            }}
          >
            <Edit className="w-4 h-4 text-foreground" />
          </button>
          <button
            className="p-1 hover:bg-destructive/10 rounded"
            title="Delete school"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Delete school
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
            Schools
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage NC high school directory
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add School
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by school name or city..."
        filters={[
          {
            label: "Classification",
            value: classificationFilter,
            onChange: setClassificationFilter,
            options: [
              { value: "all", label: "All Classifications" },
              { value: "1A", label: "1A" },
              { value: "2A", label: "2A" },
              { value: "3A", label: "3A" },
              { value: "4A", label: "4A" },
            ],
          },
        ]}
      />

      {/* Schools table */}
      <DataTable data={filteredSchools} columns={columns} />
    </div>
  );
}
