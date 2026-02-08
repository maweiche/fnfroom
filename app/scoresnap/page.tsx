'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth, ProtectedRoute } from '@/lib/auth-context';

function ScoreSnapUpload() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !token) return;

    setUploading(true);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('sport', 'BASKETBALL');
      formData.append('autoExtract', 'true');

      // Upload submission
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('Submission response:', data);

      if (!data.submission || !data.submission.id) {
        throw new Error('Invalid response: missing submission ID');
      }

      // Redirect to confirmation page
      router.push(`/scoresnap/${data.submission.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* User Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Signed in as <strong>{user?.email}</strong>
            </p>
            {user?.schoolName && (
              <p className="text-xs text-gray-500">{user.schoolName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/change-password')}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Change Password
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏀 ScoreSnap
          </h1>
          <p className="text-lg text-gray-600">
            Upload a basketball scorebook and let AI extract the data
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {!selectedFile ? (
            /* Upload Area */
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload scorebook image
                </span>
                <span className="text-sm text-gray-500">
                  PNG, JPG, WEBP up to 10MB
                </span>
              </label>
            </div>
          ) : (
            /* Preview & Upload */
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Preview
                </h2>
                <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                  {previewUrl && (
                    <Image
                      src={previewUrl}
                      alt="Scorebook preview"
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setError(null);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Choose Different Image
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Uploading & Extracting...
                    </span>
                  ) : (
                    'Upload & Extract'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            📋 Tips for Best Results
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Take photo in good lighting</li>
            <li>• Ensure scorebook is flat and clear</li>
            <li>• Include entire scorebook page</li>
            <li>• AI extraction takes 3-5 seconds</li>
            <li>• You'll review and edit extracted data before approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ScoreSnapUploadPage() {
  return (
    <ProtectedRoute>
      <ScoreSnapUpload />
    </ProtectedRoute>
  );
}
