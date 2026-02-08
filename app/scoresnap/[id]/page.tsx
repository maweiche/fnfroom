'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { BasketballGame } from '@/lib/basketball-validator';

interface ValidationError {
  id: string;
  errorCode: string;
  errorMessage: string;
  fieldPath: string | null;
  overridden: boolean;
}

interface Submission {
  id: string;
  sport: string;
  status: string;
  imageUrl: string;
  rawAiResponse: BasketballGame | null;
  processingTimeMs: number | null;
  createdAt: string;
  user: {
    name: string;
    schoolName: string | null;
  };
}

export default function SubmissionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load submission data
  useEffect(() => {
    loadSubmission();
  }, [params.id]);

  const loadSubmission = async () => {
    try {
      // TODO: Get auth token from context/cookie
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in first');
      }

      const response = await fetch(`/api/submissions/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load submission');
      }

      const data = await response.json();
      setSubmission(data.submission);
      setValidationErrors(data.validationErrors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!submission?.rawAiResponse) return;

    setApproving(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Please log in first');

      const response = await fetch(`/api/submissions/${params.id}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameData: submission.rawAiResponse,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Approval failed');
      }

      const { game } = await response.json();

      // Success! Redirect to game page or submissions list
      alert(`Game created successfully! ID: ${game.id}`);
      router.push('/scoresnap');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Submission not found'}</p>
          <button
            onClick={() => router.push('/scoresnap')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  const game = submission.rawAiResponse;
  const hasErrors = validationErrors.filter(e => !e.overridden).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/scoresnap')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← Back to Upload
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Review Extracted Data</h1>
          <p className="text-gray-600 mt-1">
            Processing time: {submission.processingTimeMs ? `${(submission.processingTimeMs / 1000).toFixed(1)}s` : 'N/A'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Scorebook Image */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Original Scorebook</h2>
              <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={submission.imageUrl}
                  alt="Scorebook"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right: Extracted Data */}
          <div className="space-y-6">
            {/* Status */}
            {submission.status === 'PROCESSING' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">⏳ Still processing... Refresh the page</p>
              </div>
            )}

            {submission.status === 'FAILED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">❌ Extraction failed. Please try uploading again.</p>
              </div>
            )}

            {/* Validation Errors */}
            {hasErrors && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-900 mb-2">
                  ⚠️ Validation Errors ({validationErrors.length})
                </h3>
                <ul className="text-sm text-red-800 space-y-1">
                  {validationErrors.map((error) => (
                    <li key={error.id}>
                      • {error.errorMessage}
                      {error.fieldPath && (
                        <span className="text-red-600 text-xs ml-2">({error.fieldPath})</span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-red-700 mt-2">
                  Please review and correct the data below before approving.
                </p>
              </div>
            )}

            {/* Game Data */}
            {game && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Extracted Game Data</h2>

                {/* Game Info */}
                <div className="mb-6 pb-6 border-b">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">{game.date || 'Not found'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-medium">{game.location || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Overtime:</span>
                      <span className="ml-2 font-medium">{game.overtime ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {/* Scores */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Final Score</h3>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="text-center flex-1">
                      <div className="text-lg font-bold text-gray-900">{game.homeTeam.name}</div>
                      <div className="text-3xl font-bold text-blue-600 mt-1">{game.homeTeam.score}</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-400">-</div>
                    <div className="text-center flex-1">
                      <div className="text-lg font-bold text-gray-900">{game.awayTeam.name}</div>
                      <div className="text-3xl font-bold text-blue-600 mt-1">{game.awayTeam.score}</div>
                    </div>
                  </div>
                </div>

                {/* Home Team Players */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">🏠 {game.homeTeam.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-right">PTS</th>
                          <th className="px-3 py-2 text-right">Fouls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {game.homeTeam.players.map((player, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2">{player.number || '?'}</td>
                            <td className="px-3 py-2">{player.name || 'Unknown'}</td>
                            <td className="px-3 py-2 text-right font-medium">{player.points}</td>
                            <td className="px-3 py-2 text-right">{player.fouls}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Away Team Players */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">✈️ {game.awayTeam.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-right">PTS</th>
                          <th className="px-3 py-2 text-right">Fouls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {game.awayTeam.players.map((player, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2">{player.number || '?'}</td>
                            <td className="px-3 py-2">{player.name || 'Unknown'}</td>
                            <td className="px-3 py-2 text-right font-medium">{player.points}</td>
                            <td className="px-3 py-2 text-right">{player.fouls}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Approve Button */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={handleApprove}
                    disabled={approving || submission.status !== 'COMPLETED'}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approving ? 'Approving...' : hasErrors ? 'Approve Anyway' : 'Approve & Create Game'}
                  </button>
                </div>

                {hasErrors && (
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Note: You can approve with errors. The game will be editable for 48 hours.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
