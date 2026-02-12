import { requireAdmin } from '@/lib/admin-auth';
import { extractSchedule } from '@/lib/schedule-extractor';
import { NextRequest } from 'next/server';

/**
 * POST /api/admin/schedules/upload
 * Upload a PDF or image schedule file, extract games via Claude Vision.
 * Returns extracted schedule for review — does NOT save to DB.
 */
export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sport = formData.get('sport') as string | null;
    const gender = formData.get('gender') as string | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: `Unsupported file type: ${file.type}. Upload a PDF or image.` },
        { status: 400 }
      );
    }

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const result = await extractSchedule(
      { data: base64, mediaType: file.type },
      sport || undefined,
      gender || undefined
    );

    return Response.json({ data: result });
  } catch (err: any) {
    console.error('Schedule upload error:', err);
    return Response.json(
      { error: 'Failed to process schedule', details: err.message },
      { status: 500 }
    );
  }
}
