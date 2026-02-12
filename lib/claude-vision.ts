import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ImageSource {
  type: 'url' | 'base64';
  data: string;
  mediaType?: string; // e.g., 'image/jpeg', 'image/png'
}

export interface ClaudeVisionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Extract structured data from an image using Claude Vision
 */
export async function extractFromImage(
  imageSource: ImageSource,
  prompt: string,
  options: ClaudeVisionOptions = {}
): Promise<{
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  processingTimeMs: number;
}> {
  const startTime = Date.now();

  try {
    // Prepare image content
    const imageContent =
      imageSource.type === 'url'
        ? {
            type: 'image' as const,
            source: {
              type: 'url' as const,
              url: imageSource.data,
            },
          }
        : {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: (imageSource.mediaType || 'image/jpeg') as
                | 'image/jpeg'
                | 'image/png'
                | 'image/gif'
                | 'image/webp',
              data: imageSource.data,
            },
          };

    const response = await anthropic.messages.create({
      model: options.model || 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0,
      messages: [
        {
          role: 'user',
          content: [imageContent, { type: 'text', text: prompt }],
        },
      ],
    });

    const processingTimeMs = Date.now() - startTime;

    // Extract text content from response
    const textContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('\n');

    return {
      content: textContent,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      processingTimeMs,
    };
  } catch (error) {
    const processingTimeMs = Date.now() - startTime;

    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Claude API Error (${error.status}): ${error.message}\n` +
          `Processing time: ${processingTimeMs}ms`
      );
    }

    throw new Error(
      `Failed to extract from image: ${error}\n` +
        `Processing time: ${processingTimeMs}ms`
    );
  }
}

/**
 * Extract JSON from an image using Claude Vision
 * Automatically handles JSON parsing and validation
 */
export async function extractJSONFromImage<T = any>(
  imageSource: ImageSource,
  prompt: string,
  options: ClaudeVisionOptions = {}
): Promise<{
  data: T;
  raw: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  processingTimeMs: number;
}> {
  // Add JSON instruction to prompt
  const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations, just the JSON object.`;

  const result = await extractFromImage(imageSource, jsonPrompt, options);

  try {
    // Try to parse JSON from response
    let jsonString = result.content.trim();

    // Remove markdown code blocks if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const data = JSON.parse(jsonString);

    return {
      data,
      raw: result.content,
      usage: result.usage,
      processingTimeMs: result.processingTimeMs,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse JSON from Claude response:\n${result.content}\n\nError: ${error}`
    );
  }
}

export interface DocumentSource {
  data: string; // base64
  mediaType: 'application/pdf';
}

/**
 * Extract structured data from a PDF document using Claude
 */
export async function extractFromDocument(
  documentSource: DocumentSource,
  prompt: string,
  options: ClaudeVisionOptions = {}
): Promise<{
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  processingTimeMs: number;
}> {
  const startTime = Date.now();

  try {
    const documentContent = {
      type: 'document' as const,
      source: {
        type: 'base64' as const,
        media_type: documentSource.mediaType,
        data: documentSource.data,
      },
    };

    const response = await anthropic.messages.create({
      model: options.model || 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0,
      messages: [
        {
          role: 'user',
          content: [documentContent, { type: 'text', text: prompt }],
        },
      ],
    });

    const processingTimeMs = Date.now() - startTime;

    const textContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('\n');

    return {
      content: textContent,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      processingTimeMs,
    };
  } catch (error) {
    const processingTimeMs = Date.now() - startTime;

    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Claude API Error (${error.status}): ${error.message}\n` +
          `Processing time: ${processingTimeMs}ms`
      );
    }

    throw new Error(
      `Failed to extract from document: ${error}\n` +
        `Processing time: ${processingTimeMs}ms`
    );
  }
}

/**
 * Extract JSON from a PDF document using Claude
 */
export async function extractJSONFromDocument<T = any>(
  documentSource: DocumentSource,
  prompt: string,
  options: ClaudeVisionOptions = {}
): Promise<{
  data: T;
  raw: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  processingTimeMs: number;
}> {
  const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations, just the JSON object.`;

  const result = await extractFromDocument(documentSource, jsonPrompt, options);

  try {
    let jsonString = result.content.trim();

    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const data = JSON.parse(jsonString);

    return {
      data,
      raw: result.content,
      usage: result.usage,
      processingTimeMs: result.processingTimeMs,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse JSON from Claude response:\n${result.content}\n\nError: ${error}`
    );
  }
}

/**
 * Load a file (image or PDF) and convert to base64
 */
export async function fileToBase64(
  filePath: string
): Promise<{ data: string; mediaType: string }> {
  const file = Bun.file(filePath);
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  const ext = filePath.toLowerCase().split('.').pop();
  const mediaType =
    ext === 'pdf'
      ? 'application/pdf'
      : ext === 'png'
        ? 'image/png'
        : ext === 'jpg' || ext === 'jpeg'
          ? 'image/jpeg'
          : ext === 'gif'
            ? 'image/gif'
            : ext === 'webp'
              ? 'image/webp'
              : 'image/jpeg';

  return { data: base64, mediaType };
}

/**
 * Load an image from a file path and convert to base64
 */
export async function imageFileToBase64(
  filePath: string
): Promise<{ data: string; mediaType: string }> {
  const file = Bun.file(filePath);
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  const ext = filePath.toLowerCase().split('.').pop();
  const mediaType =
    ext === 'png'
      ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : ext === 'gif'
          ? 'image/gif'
          : ext === 'webp'
            ? 'image/webp'
            : 'image/jpeg'; // default

  return { data: base64, mediaType };
}
