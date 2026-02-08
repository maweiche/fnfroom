import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getTokenFromHeader } from '@/lib/auth';
import { uploadImageToSanity } from '@/lib/sanity-upload';
import { extractBasketballGame } from '@/lib/scoresnap-extractor';

/**
 * POST /api/submissions
 * Create a new submission and optionally trigger AI extraction
 *
 * Body:
 * - image: File (multipart/form-data)
 * - sport: "BASKETBALL" | "FOOTBALL"
 * - autoExtract?: boolean (default: true)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const sport = (formData.get('sport') as string) || 'BASKETBALL';
    const autoExtract = formData.get('autoExtract') !== 'false';

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload image to Sanity CDN
    const uploadResult = await uploadImageToSanity(
      buffer,
      imageFile.name,
      imageFile.type
    );

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        sport,
        status: autoExtract ? 'PROCESSING' : 'DRAFT',
        imageUrl: uploadResult.url,
        imageAssetId: uploadResult.assetId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            schoolName: true,
          },
        },
      },
    });

    // If autoExtract, trigger AI extraction
    if (autoExtract) {
      // Run extraction in background (don't await)
      extractAndSave(submission.id, uploadResult.url).catch((error) => {
        console.error('Background extraction failed:', error);
      });
    }

    const response = {
      submission: {
        id: submission.id,
        sport: submission.sport,
        status: submission.status,
        imageUrl: submission.imageUrl,
        createdAt: submission.createdAt,
        user: submission.user,
      },
    };

    console.log('Returning submission response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Submission creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

/**
 * Background task: Extract game data and save results
 */
async function extractAndSave(submissionId: string, imageUrl: string) {
  try {
    const startTime = Date.now();

    // Run AI extraction
    const result = await extractBasketballGame({
      type: 'url',
      data: imageUrl,
    });

    const processingTimeMs = Date.now() - startTime;

    // Update submission with results
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: result.success ? 'COMPLETED' : 'FAILED',
        rawAiResponse: result.game ? (result.game as any) : null,
        processingTimeMs,
      },
    });

    // Save validation errors
    if (result.validationErrors.length > 0) {
      await prisma.validationError.createMany({
        data: result.validationErrors.map((error) => ({
          submissionId,
          errorCode: error.code,
          errorMessage: error.message,
          fieldPath: error.fieldPath || null,
        })),
      });
    }

    console.log(`Extraction completed for submission ${submissionId}: ${result.success ? 'success' : 'failed'}`);
  } catch (error) {
    console.error(`Extraction failed for submission ${submissionId}:`, error);

    // Mark as failed
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'FAILED' },
    });
  }
}

/**
 * GET /api/submissions
 * List submissions for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's submissions
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50
      select: {
        id: true,
        sport: true,
        status: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Submissions list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
