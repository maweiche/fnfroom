import { createClient } from '@sanity/client';
import type { SanityImageAssetDocument } from '@sanity/client';

/**
 * Sanity client with write access for uploading images
 * Uses SANITY_API_TOKEN from environment
 */
const uploadClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN, // Required for uploads
  useCdn: false, // Don't use CDN for writes
});

export interface UploadResult {
  assetId: string;
  url: string;
  originalFilename: string;
  size: number;
  mimeType: string;
}

/**
 * Upload an image to Sanity CDN
 * @param imageBuffer - The image file buffer
 * @param filename - Original filename (for metadata)
 * @param contentType - MIME type of the image
 * @returns Upload result with asset ID and URL
 */
export async function uploadImageToSanity(
  imageBuffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  if (!process.env.SANITY_API_TOKEN) {
    throw new Error('SANITY_API_TOKEN not configured');
  }

  try {
    const asset = await uploadClient.assets.upload('image', imageBuffer, {
      filename,
      contentType,
    });

    return {
      assetId: asset._id,
      url: asset.url,
      originalFilename: asset.originalFilename || filename,
      size: asset.size,
      mimeType: asset.mimeType,
    };
  } catch (error) {
    console.error('Sanity upload error:', error);
    throw new Error(`Failed to upload image to Sanity: ${error}`);
  }
}

/**
 * Delete an image from Sanity CDN
 * @param assetId - The Sanity asset ID (e.g., "image-abc123-500x500-jpg")
 */
export async function deleteImageFromSanity(assetId: string): Promise<void> {
  if (!process.env.SANITY_API_TOKEN) {
    throw new Error('SANITY_API_TOKEN not configured');
  }

  try {
    await uploadClient.delete(assetId);
  } catch (error) {
    console.error('Sanity delete error:', error);
    throw new Error(`Failed to delete image from Sanity: ${error}`);
  }
}

/**
 * Get image metadata from Sanity
 */
export async function getImageMetadata(assetId: string) {
  try {
    const asset = await uploadClient.getDocument<SanityImageAssetDocument>(assetId);
    return asset;
  } catch (error) {
    console.error('Sanity metadata error:', error);
    return null;
  }
}
