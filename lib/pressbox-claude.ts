/**
 * Press Box AI - Claude API Integration
 * Handles conversation and article generation
 */

import Anthropic from '@anthropic-ai/sdk';
import { PROMPTS } from './pressbox-prompts';

let claudeInstance: Anthropic | null = null;

export function getClaude(): Anthropic {
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
    turnCount < 5
      ? '\n\nCURRENT PHASE: GAME IDENTIFICATION - Focus on basic details (teams, score, date, location).'
      : turnCount < 10
      ? '\n\nCURRENT PHASE: NARRATIVE - Get the story of the game, turning points, momentum shifts.'
      : turnCount < 15
      ? '\n\nCURRENT PHASE: STANDOUT PERFORMERS - Ask about key players and their stats.'
      : turnCount < 20
      ? '\n\nCURRENT PHASE: CONTEXT - Atmosphere, crowd, season implications, storylines.'
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

export async function generateArticle(
  transcript: Array<{ role: string; content: string }>,
  sport: string,
  homeTeam: string,
  awayTeam: string,
  writerStyle: string | null
): Promise<{ headline: string; body: string }> {
  const claude = getClaude();
  const prompt = buildArticlePrompt(transcript, sport, homeTeam, awayTeam, writerStyle);

  const response = await claude.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const articleText = response.content[0].type === 'text'
    ? response.content[0].text
    : '';

  // Extract headline and body
  const lines = articleText.split('\n');
  const headline = lines[0].replace(/^#+\s*/, '').trim();
  const body = lines.slice(1).join('\n').trim();

  return { headline, body };
}
