#!/usr/bin/env bun
/**
 * Test conversation creation
 */
import { authenticateUser } from '../lib/auth';

async function main() {
  console.log('Testing conversation creation...\n');

  // Step 1: Get token
  const auth = await authenticateUser('maweiche@gmail.com', 'writer123');
  if (!auth) {
    console.error('❌ Authentication failed');
    return;
  }

  console.log('✅ Got auth token\n');

  // Step 2: Create conversation
  const conversationData = {
    sport: 'football',
    homeTeam: 'Wake Forest',
    awayTeam: 'Chapel Hill',
    gameDate: new Date().toISOString(),
    location: 'Wake Forest High School',
  };

  console.log('Creating conversation with data:', conversationData);

  try {
    const response = await fetch('http://localhost:3000/api/pressbox/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
      body: JSON.stringify(conversationData),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Failed to create conversation');
    } else {
      console.log('✅ Conversation created successfully!');
      console.log('Conversation ID:', data.conversation.id);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
