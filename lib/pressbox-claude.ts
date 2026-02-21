/**
 * Press Box AI - Multi-Provider AI Integration
 * Supports Anthropic Claude and Google Gemini
 */

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PROMPTS } from './pressbox-prompts';

type AIProvider = 'anthropic' | 'gemini';

let claudeInstance: Anthropic | null = null;
let geminiInstance: GoogleGenerativeAI | null = null;

export function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase() || 'gemini';
  return provider === 'anthropic' ? 'anthropic' : 'gemini';
}

function getClaude(): Anthropic {
  if (!claudeInstance) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not set in environment variables');
    }
    claudeInstance = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return claudeInstance;
}

function getGemini(): GoogleGenerativeAI {
  if (!geminiInstance) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not set in environment variables');
    }
    geminiInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiInstance;
}

export function buildInterviewPrompt(
  sport: string,
  writerStyle: string | null,
  turnCount: number
): string {
  const basePrompt = PROMPTS.INTERVIEW_FLOW.replace('{{SPORT}}', sport);

  const styleNotes = writerStyle
    ? `\n\nWRITER STYLE NOTES:\n${writerStyle}\n\nAdjust your questions to match their writing style.`
    : '';

  const phaseGuidance =
    turnCount < 2
      ? '\n\nCURRENT PHASE: INITIAL - Read their message carefully. Acknowledge what they provided, then ask ONLY about missing details. Skip any phase already covered.'
      : turnCount < 10
      ? '\n\nCURRENT PHASE: GAP FILLING - Only ask about details not yet covered: game flow, standout performers, key stats, context.'
      : '\n\nCURRENT PHASE: WRAP-UP - Check for missing details, corrections, ready to generate.';

  return basePrompt + styleNotes + phaseGuidance;
}

export function buildArticlePrompt(
  transcript: Array<{ role: string; content: string }>,
  sport: string,
  homeTeam: string,
  awayTeam: string,
  writerStyle: string | null
): string {
  const conversationText = transcript
    .map(t => `${t.role.toUpperCase()}: ${t.content}`)
    .join('\n\n');

  let basePrompt = PROMPTS.ARTICLE_GENERATION
    .replace('{{SPORT}}', sport)
    .replace('{{HOME_TEAM}}', homeTeam)
    .replace('{{AWAY_TEAM}}', awayTeam)
    .replace('{{EDITORIAL_VOICE}}', PROMPTS.EDITORIAL_VOICE);

  const styleNotes = writerStyle
    ? `\n\nWRITER STYLE GUIDE:\n${writerStyle}\n\nMatch this style exactly. This is how the writer naturally writes.`
    : '';

  return `${basePrompt}${styleNotes}\n\n---\n\nCONVERSATION TRANSCRIPT:\n${conversationText}\n\n---\n\nNow write the article following the structure above.`;
}

export async function getConversationResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): Promise<string> {
  const provider = getProvider();

  if (provider === 'gemini') {
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  } else {
    const claude = getClaude();
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }
}

export async function generateArticle(
  transcript: Array<{ role: string; content: string }>,
  sport: string,
  homeTeam: string,
  awayTeam: string,
  writerStyle: string | null
): Promise<{ headline: string; body: string }> {
  const provider = getProvider();
  const prompt = buildArticlePrompt(transcript, sport, homeTeam, awayTeam, writerStyle);

  let articleText: string;

  if (provider === 'gemini') {
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    articleText = result.response.text();
  } else {
    const claude = getClaude();
    const response = await claude.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    articleText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';
  }

  // Extract headline and body
  const lines = articleText.split('\n');
  const headline = lines[0].replace(/^#+\s*/, '').trim();
  const body = lines.slice(1).join('\n').trim();

  return { headline, body };
}
