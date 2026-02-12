"use client";

import { useState, useCallback } from "react";
import { Upload, Loader2, Check, Trash2, Pencil, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ExtractedGame {
  date: string;
  time: string | null;
  opponent: string;
  opponentCity: string | null;
  isHome: boolean;
  isConference: boolean;
  location: string | null;
}

interface ExtractedSchedule {
  teamName: string;
  sport: string;
  gender: string;
  season: string;
  city: string | null;
  classification: string | null;
  conference: string | null;
  games: ExtractedGame[];
}

type Phase = "upload" | "processing" | "review" | "confirming" | "success";

interface ConfirmResult {
  gamesCreated: number;
  gamesSkipped: number;
  schoolsCreated: string[];
  skippedReasons: string[];
  hostSchool: { id: string; name: string };
}

function getAuthToken() {
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

export default function ScheduleUploadPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [schedule, setSchedule] = useState<ExtractedSchedule | null>(null);
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
        const res = await fetch("/api/admin/schedules/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Upload failed");
        }

        const extraction = json.data;
        if (!extraction.success || !extraction.schedule) {
          throw new Error(
            extraction.errors?.join(", ") || "Failed to extract schedule"
          );
        }

        setSchedule(extraction.schedule);
        setPhase("review");
      } catch (err: any) {
        setError(err.message);
        setPhase("upload");
      }
    },
    [sport, gender]
  );

  const handleConfirm = useCallback(async () => {
    if (!schedule) return;
    setError(null);
    setPhase("confirming");

    const token = getAuthToken();

    try {
      const res = await fetch("/api/admin/schedules/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(schedule),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to confirm schedule");
      }

      setResult(json.data);
      setPhase("success");
    } catch (err: any) {
      setError(err.message);
      setPhase("review");
    }
  }, [schedule]);

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

  const deleteGame = (index: number) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      games: schedule.games.filter((_, i) => i !== index),
    });
  };

  const updateGame = (index: number, updates: Partial<ExtractedGame>) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      games: schedule.games.map((g, i) =>
        i === index ? { ...g, ...updates } : g
      ),
    });
  };

  const updateScheduleField = (
    field: keyof ExtractedSchedule,
    value: string
  ) => {
    if (!schedule) return;
    setSchedule({ ...schedule, [field]: value });
  };

  const reset = () => {
    setPhase("upload");
    setSchedule(null);
    setResult(null);
    setError(null);
    setEditingRow(null);
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Schedule Upload
        </h1>
        <p className="text-sm text-muted mt-1">
          Upload a team schedule (PDF or screenshot) to create game records
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
              document.getElementById("schedule-file-input")?.click()
            }
          >
            <Upload className="w-10 h-10 text-muted mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">
              Drop a schedule file here, or click to browse
            </p>
            <p className="text-xs text-muted">
              Supports PDF, JPEG, PNG, WebP
            </p>
            <input
              id="schedule-file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Processing Phase */}
      {(phase === "processing" || phase === "confirming") && (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Loader2 className="w-10 h-10 text-[#E6BC6A] mx-auto mb-4 animate-spin" />
          <p className="text-foreground font-medium">
            {phase === "processing"
              ? "Extracting schedule with AI..."
              : "Saving games to database..."}
          </p>
          <p className="text-xs text-muted mt-1">
            {phase === "processing"
              ? "This may take 10-30 seconds"
              : "Creating schools and game records"}
          </p>
        </div>
      )}

      {/* Review Phase */}
      {phase === "review" && schedule && (
        <div className="space-y-4">
          {/* Team info card */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Team Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={schedule.teamName}
                  onChange={(e) =>
                    updateScheduleField("teamName", e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Sport
                </label>
                <select
                  value={schedule.sport}
                  onChange={(e) =>
                    updateScheduleField("sport", e.target.value)
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
                  value={schedule.gender}
                  onChange={(e) =>
                    updateScheduleField("gender", e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Season
                </label>
                <input
                  type="text"
                  value={schedule.season}
                  onChange={(e) =>
                    updateScheduleField("season", e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Conference
                </label>
                <input
                  type="text"
                  value={schedule.conference || ""}
                  onChange={(e) =>
                    updateScheduleField("conference", e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Classification
                </label>
                <input
                  type="text"
                  value={schedule.classification || ""}
                  onChange={(e) =>
                    updateScheduleField("classification", e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Games table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Games ({schedule.games.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-medium text-muted">
                      #
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-muted">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-muted">
                      Time
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-muted">
                      Opponent
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-muted">
                      H/A
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-muted">
                      Conf
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-muted w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.games.map((game, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/50 hover:bg-background/50"
                    >
                      {editingRow === i ? (
                        <>
                          <td className="px-4 py-2 text-muted">{i + 1}</td>
                          <td className="px-4 py-2">
                            <input
                              type="date"
                              value={game.date}
                              onChange={(e) =>
                                updateGame(i, { date: e.target.value })
                              }
                              className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground w-36"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={game.time || ""}
                              onChange={(e) =>
                                updateGame(i, {
                                  time: e.target.value || null,
                                })
                              }
                              placeholder="7:00 PM"
                              className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground w-24"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={game.opponent}
                              onChange={(e) =>
                                updateGame(i, { opponent: e.target.value })
                              }
                              className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground w-48"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={game.isHome ? "home" : "away"}
                              onChange={(e) =>
                                updateGame(i, {
                                  isHome: e.target.value === "home",
                                })
                              }
                              className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground"
                            >
                              <option value="home">Home</option>
                              <option value="away">Away</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={game.isConference}
                              onChange={(e) =>
                                updateGame(i, {
                                  isConference: e.target.checked,
                                })
                              }
                              className="accent-[#E6BC6A]"
                            />
                          </td>
                          <td className="px-4 py-2">
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
                          <td className="px-4 py-2 text-muted">{i + 1}</td>
                          <td className="px-4 py-2 text-foreground font-mono text-xs">
                            {game.date}
                          </td>
                          <td className="px-4 py-2 text-foreground text-xs">
                            {game.time || "—"}
                          </td>
                          <td className="px-4 py-2 text-foreground">
                            {game.opponent}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded ${
                                game.isHome
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {game.isHome ? "Home" : "Away"}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {game.isConference && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#E6BC6A]/20 text-[#E6BC6A]">
                                Conf
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 flex gap-1">
                            <button
                              onClick={() => setEditingRow(i)}
                              className="text-muted hover:text-foreground p-1"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteGame(i)}
                              className="text-muted hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirm}
              disabled={schedule.games.length === 0}
              className="bg-[#E6BC6A] text-[#1a1d29] px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-[#E6BC6A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm & Create {schedule.games.length} Games
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
              Schedule Imported
            </h2>
            <p className="text-sm text-muted mb-6">
              {result.gamesCreated} games created for{" "}
              {result.hostSchool.name}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
              <div className="bg-background rounded-md p-3">
                <p className="text-2xl font-bold font-mono text-foreground">
                  {result.gamesCreated}
                </p>
                <p className="text-xs text-muted">Games created</p>
              </div>
              <div className="bg-background rounded-md p-3">
                <p className="text-2xl font-bold font-mono text-foreground">
                  {result.gamesSkipped}
                </p>
                <p className="text-xs text-muted">Duplicates skipped</p>
              </div>
              <div className="bg-background rounded-md p-3">
                <p className="text-2xl font-bold font-mono text-foreground">
                  {result.schoolsCreated.length}
                </p>
                <p className="text-xs text-muted">New schools</p>
              </div>
            </div>

            {result.schoolsCreated.length > 0 && (
              <div className="mt-4 text-left max-w-lg mx-auto">
                <p className="text-xs font-medium text-muted mb-1">
                  New schools created:
                </p>
                <p className="text-xs text-foreground">
                  {result.schoolsCreated.join(", ")}
                </p>
              </div>
            )}

            {result.skippedReasons.length > 0 && (
              <div className="mt-4 text-left max-w-lg mx-auto">
                <p className="text-xs font-medium text-muted mb-1">
                  Skipped (duplicates):
                </p>
                <ul className="text-xs text-muted space-y-0.5">
                  {result.skippedReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/games"
              className="bg-[#E6BC6A] text-[#1a1d29] px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-[#E6BC6A]/90 transition-colors"
            >
              View Games
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
