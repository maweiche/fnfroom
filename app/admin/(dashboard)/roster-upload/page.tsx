"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  Loader2,
  Check,
  Trash2,
  Pencil,
} from "lucide-react";
import Link from "next/link";

interface ExtractedPlayer {
  jerseyNumber: string | null;
  firstName: string;
  lastName: string;
  position: string | null;
  grade: string | null;
  progressedGrade: string | null;
  heightFeet: number | null;
  heightInches: number | null;
  weight: number | null;
  dropped: boolean;
}

interface ExtractedRoster {
  schoolName: string;
  sport: string;
  gender: string;
  sourceSeason: string;
  targetSeason: string;
  players: ExtractedPlayer[];
}

type Phase = "upload" | "processing" | "review" | "confirming" | "success";

interface ConfirmResult {
  playersCreated: number;
  playersUpdated: number;
  rosterEntriesCreated: number;
  droppedSeniors: number;
  schoolCreated: boolean;
  school: { id: string; name: string };
}

function getAuthToken() {
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

export default function RosterUploadPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [roster, setRoster] = useState<ExtractedRoster | null>(null);
  const [result, setResult] = useState<ConfirmResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);

  // Upload form state
  const [sport, setSport] = useState("");
  const [gender, setGender] = useState("");

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setPhase("processing");

      const token = getAuthToken();
      const formData = new FormData();
      formData.append("file", file);
      if (sport) formData.append("sport", sport);
      if (gender) formData.append("gender", gender);

      try {
        const res = await fetch("/api/admin/rosters/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Upload failed");
        }

        const extraction = json.data;
        if (!extraction.success || !extraction.roster) {
          throw new Error(
            extraction.errors?.join(", ") || "Failed to extract roster"
          );
        }

        setRoster(extraction.roster);
        setPhase("review");
      } catch (err: any) {
        setError(err.message);
        setPhase("upload");
      }
    },
    [sport, gender]
  );

  const activeCount = roster
    ? roster.players.filter((p) => !p.dropped).length
    : 0;

  const handleConfirm = useCallback(async () => {
    if (!roster) return;
    setError(null);
    setPhase("confirming");

    const token = getAuthToken();

    try {
      const res = await fetch("/api/admin/rosters/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roster),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to confirm roster");
      }

      setResult(json.data);
      setPhase("success");
    } catch (err: any) {
      setError(err.message);
      setPhase("review");
    }
  }, [roster]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const deletePlayer = (index: number) => {
    if (!roster) return;
    setRoster({
      ...roster,
      players: roster.players.filter((_, i) => i !== index),
    });
  };

  const updatePlayer = (index: number, updates: Partial<ExtractedPlayer>) => {
    if (!roster) return;
    setRoster({
      ...roster,
      players: roster.players.map((p, i) =>
        i === index ? { ...p, ...updates } : p
      ),
    });
  };

  const updateRosterField = (
    field: keyof ExtractedRoster,
    value: string
  ) => {
    if (!roster) return;
    setRoster({ ...roster, [field]: value });
  };

  const reset = () => {
    setPhase("upload");
    setRoster(null);
    setResult(null);
    setError(null);
    setEditingRow(null);
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Roster Upload
        </h1>
        <p className="text-sm text-muted mt-1">
          Upload a team roster (PDF or screenshot) to create player and roster
          records. Grades are automatically advanced by one year.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Upload Phase */}
      {phase === "upload" && (
        <div className="space-y-4">
          {/* Optional overrides */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Optional Overrides
            </h2>
            <p className="text-xs text-muted mb-4">
              The AI will detect sport and gender from the document. Set these
              only if you want to override.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Sport
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Auto-detect</option>
                  <option value="BASKETBALL">Basketball</option>
                  <option value="FOOTBALL">Football</option>
                  <option value="LACROSSE">Lacrosse</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Auto-detect</option>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`bg-card rounded-lg border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
              dragActive
                ? "border-[#E6BC6A] bg-[#E6BC6A]/5"
                : "border-border hover:border-[#E6BC6A]/50"
            }`}
            onClick={() =>
              document.getElementById("roster-file-input")?.click()
            }
          >
            <Upload className="w-10 h-10 text-muted mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">
              Drop a roster file here, or click to browse
            </p>
            <p className="text-xs text-muted">
              Supports PDF, JPEG, PNG, WebP
            </p>
            <input
              id="roster-file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Processing / Confirming Phase */}
      {(phase === "processing" || phase === "confirming") && (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Loader2 className="w-10 h-10 text-[#E6BC6A] mx-auto mb-4 animate-spin" />
          <p className="text-foreground font-medium">
            {phase === "processing"
              ? "Extracting roster with AI..."
              : "Saving players to database..."}
          </p>
          <p className="text-xs text-muted mt-1">
            {phase === "processing"
              ? "This may take 10-30 seconds"
              : "Creating player and roster records"}
          </p>
        </div>
      )}

      {/* Review Phase */}
      {phase === "review" && roster && (
        <div className="space-y-4">
          {/* School info card */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Roster Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={roster.schoolName}
                  onChange={(e) =>
                    updateRosterField("schoolName", e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Sport
                </label>
                <select
                  value={roster.sport}
                  onChange={(e) =>
                    updateRosterField("sport", e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                >
                  <option value="BASKETBALL">Basketball</option>
                  <option value="FOOTBALL">Football</option>
                  <option value="LACROSSE">Lacrosse</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Gender
                </label>
                <select
                  value={roster.gender}
                  onChange={(e) =>
                    updateRosterField("gender", e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Source Season
                </label>
                <input
                  type="text"
                  value={roster.sourceSeason}
                  onChange={(e) =>
                    updateRosterField("sourceSeason", e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Target Season
                </label>
                <input
                  type="text"
                  value={roster.targetSeason}
                  onChange={(e) =>
                    updateRosterField("targetSeason", e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Players table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Players ({roster.players.length} total, {activeCount} active,{" "}
                {roster.players.length - activeCount} graduating)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-3 py-3 text-xs font-medium text-muted">
                      #
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-muted">
                      Jersey
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-muted">
                      First Name
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-muted">
                      Last Name
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-muted">
                      Pos
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-muted">
                      Source Gr.
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-muted">
                      New Gr.
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-muted">
                      Ht
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-muted">
                      Wt
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-muted w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roster.players.map((player, i) => {
                    const isDropped = player.dropped;
                    const rowClass = isDropped
                      ? "border-b border-border/50 bg-red-500/5 opacity-60"
                      : "border-b border-border/50 hover:bg-background/50";

                    return (
                      <tr key={i} className={rowClass}>
                        {editingRow === i ? (
                          <>
                            <td className="px-3 py-2 text-muted">{i + 1}</td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={player.jerseyNumber || ""}
                                onChange={(e) =>
                                  updatePlayer(i, {
                                    jerseyNumber: e.target.value || null,
                                  })
                                }
                                className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground w-14"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={player.firstName}
                                onChange={(e) =>
                                  updatePlayer(i, {
                                    firstName: e.target.value,
                                  })
                                }
                                className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground w-28"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={player.lastName}
                                onChange={(e) =>
                                  updatePlayer(i, {
                                    lastName: e.target.value,
                                  })
                                }
                                className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground w-28"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={player.position || ""}
                                onChange={(e) =>
                                  updatePlayer(i, {
                                    position: e.target.value || null,
                                  })
                                }
                                className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground w-14"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={player.grade || ""}
                                onChange={(e) => {
                                  const newGrade = e.target.value || null;
                                  const progression: Record<string, string> = {
                                    FR: "SO",
                                    SO: "JR",
                                    JR: "SR",
                                    SR: "SR",
                                  };
                                  updatePlayer(i, {
                                    grade: newGrade,
                                    progressedGrade: newGrade
                                      ? progression[newGrade] || newGrade
                                      : null,
                                    dropped: newGrade === "SR",
                                  });
                                }}
                                className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground"
                              >
                                <option value="">—</option>
                                <option value="FR">FR</option>
                                <option value="SO">SO</option>
                                <option value="JR">JR</option>
                                <option value="SR">SR</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 text-xs text-muted">
                              {player.progressedGrade || "—"}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={player.heightFeet ?? ""}
                                  onChange={(e) =>
                                    updatePlayer(i, {
                                      heightFeet: e.target.value
                                        ? parseInt(e.target.value)
                                        : null,
                                    })
                                  }
                                  className="bg-background border border-border rounded px-1 py-1 text-xs text-foreground w-10 text-center"
                                  placeholder="ft"
                                />
                                <span className="text-muted text-xs">&apos;</span>
                                <input
                                  type="number"
                                  value={player.heightInches ?? ""}
                                  onChange={(e) =>
                                    updatePlayer(i, {
                                      heightInches: e.target.value
                                        ? parseInt(e.target.value)
                                        : null,
                                    })
                                  }
                                  className="bg-background border border-border rounded px-1 py-1 text-xs text-foreground w-10 text-center"
                                  placeholder="in"
                                />
                                <span className="text-muted text-xs">&quot;</span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={player.weight ?? ""}
                                onChange={(e) =>
                                  updatePlayer(i, {
                                    weight: e.target.value
                                      ? parseInt(e.target.value)
                                      : null,
                                  })
                                }
                                className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground w-16"
                                placeholder="lbs"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => setEditingRow(null)}
                                className="text-[#E6BC6A] hover:text-[#E6BC6A]/80"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 text-muted">{i + 1}</td>
                            <td
                              className={`px-3 py-2 font-mono text-xs ${
                                isDropped
                                  ? "line-through text-muted"
                                  : "text-foreground"
                              }`}
                            >
                              {player.jerseyNumber || "—"}
                            </td>
                            <td
                              className={`px-3 py-2 ${
                                isDropped
                                  ? "line-through text-muted"
                                  : "text-foreground"
                              }`}
                            >
                              {player.firstName}
                            </td>
                            <td
                              className={`px-3 py-2 ${
                                isDropped
                                  ? "line-through text-muted"
                                  : "text-foreground"
                              }`}
                            >
                              {player.lastName}
                            </td>
                            <td className="px-3 py-2 text-foreground text-xs">
                              {player.position || "—"}
                            </td>
                            <td className="px-3 py-2 text-muted text-xs">
                              {player.grade || "—"}
                            </td>
                            <td className="px-3 py-2">
                              {isDropped ? (
                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                                  GRADUATED
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-foreground">
                                  {player.progressedGrade || "—"}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-foreground text-xs font-mono">
                              {player.heightFeet != null &&
                              player.heightInches != null
                                ? `${player.heightFeet}'${player.heightInches}"`
                                : "—"}
                            </td>
                            <td className="px-3 py-2 text-foreground text-xs font-mono">
                              {player.weight != null
                                ? `${player.weight}`
                                : "—"}
                            </td>
                            <td className="px-3 py-2 flex gap-1">
                              <button
                                onClick={() => setEditingRow(i)}
                                className="text-muted hover:text-foreground p-1"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deletePlayer(i)}
                                className="text-muted hover:text-red-400 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirm}
              disabled={activeCount === 0}
              className="bg-[#E6BC6A] text-[#1a1d29] px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-[#E6BC6A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm & Import {activeCount} Players
            </button>
            <button
              onClick={reset}
              className="px-6 py-2.5 rounded-md text-sm font-medium text-muted hover:text-foreground border border-border hover:border-border/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success Phase */}
      {phase === "success" && result && (
        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-green-500/30 p-8 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Roster Imported
            </h2>
            <p className="text-sm text-muted mb-6">
              {result.rosterEntriesCreated} roster entries created for{" "}
              {result.school.name}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto text-left">
              <div className="bg-background rounded-md p-3">
                <p className="text-2xl font-bold font-mono text-foreground">
                  {result.playersCreated}
                </p>
                <p className="text-xs text-muted">New players</p>
              </div>
              <div className="bg-background rounded-md p-3">
                <p className="text-2xl font-bold font-mono text-foreground">
                  {result.playersUpdated}
                </p>
                <p className="text-xs text-muted">Updated</p>
              </div>
              <div className="bg-background rounded-md p-3">
                <p className="text-2xl font-bold font-mono text-foreground">
                  {result.rosterEntriesCreated}
                </p>
                <p className="text-xs text-muted">Roster entries</p>
              </div>
              <div className="bg-background rounded-md p-3">
                <p className="text-2xl font-bold font-mono text-foreground">
                  {result.droppedSeniors}
                </p>
                <p className="text-xs text-muted">Seniors dropped</p>
              </div>
            </div>

            {result.schoolCreated && (
              <div className="mt-4 text-left max-w-xl mx-auto">
                <p className="text-xs text-muted">
                  New school created:{" "}
                  <span className="text-foreground font-medium">
                    {result.school.name}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/rosters"
              className="bg-[#E6BC6A] text-[#1a1d29] px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-[#E6BC6A]/90 transition-colors"
            >
              View Rosters
            </Link>
            <button
              onClick={reset}
              className="px-6 py-2.5 rounded-md text-sm font-medium text-muted hover:text-foreground border border-border hover:border-border/80 transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
