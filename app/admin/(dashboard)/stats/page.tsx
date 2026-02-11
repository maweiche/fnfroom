"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, AlertCircle } from "lucide-react";

export default function StatsPage() {
  const [uploading, setUploading] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setImportStatus(null);

    // TODO: Implement CSV/JSON import
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock result
    setImportStatus({
      success: 150,
      failed: 5,
      errors: ["Row 23: Invalid player ID", "Row 45: Missing required field"],
    });
    setUploading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Stats Management
        </h1>
        <p className="text-sm text-muted mt-1">
          Bulk import and manage player statistics
        </p>
      </div>

      {/* Import section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-display font-bold text-foreground mb-4">
          Bulk Import
        </h2>
        <p className="text-sm text-muted mb-6">
          Upload a CSV or JSON file with player statistics. The file should
          include player ID, sport, season, stat type, and values.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/5 transition-colors"
            >
              <div className="text-center">
                <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted mt-1">CSV or JSON files</p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {uploading && (
            <div className="bg-info/10 border border-info/20 rounded-md p-4">
              <p className="text-sm text-info">Processing import...</p>
            </div>
          )}

          {importStatus && (
            <div className="space-y-4">
              <div className="bg-success/10 border border-success/20 rounded-md p-4">
                <p className="text-sm text-success font-medium">
                  Successfully imported {importStatus.success} records
                </p>
              </div>

              {importStatus.failed > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-destructive font-medium mb-2">
                        {importStatus.failed} records failed to import
                      </p>
                      <ul className="text-xs text-destructive space-y-1">
                        {importStatus.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Export section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-display font-bold text-foreground mb-4">
          Export Data
        </h2>
        <p className="text-sm text-muted mb-6">
          Download current statistics data in CSV format
        </p>

        <div className="flex gap-4">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export All Stats
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Basketball
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Football
          </Button>
        </div>
      </div>

      {/* Data format guide */}
      <div className="bg-muted/10 rounded-lg border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Import File Format
        </h3>
        <p className="text-xs text-muted mb-3">
          CSV files should include the following columns:
        </p>
        <code className="block text-xs font-mono bg-card p-3 rounded border border-border">
          playerId,sport,season,statType,value,gamesPlayed
        </code>
        <p className="text-xs text-muted mt-3">
          Example:
        </p>
        <code className="block text-xs font-mono bg-card p-3 rounded border border-border">
          abc-123,basketball,2024-25,PPG,18.5,12
        </code>
      </div>
    </div>
  );
}
