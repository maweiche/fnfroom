#!/usr/bin/env bun
/**
 * Press Box AI API Test
 * Tests the complete conversation → article flow
 */

import { authenticateUser } from '../lib/auth';

const API_BASE = 'http://localhost:3000/api/pressbox';

async function testPressBoxAPI() {
  console.log('🧪 Testing Press Box AI API');
  console.log('============================\n');

  // Step 1: Login
  console.log('Step 1: Authenticating...');
  const auth = await authenticateUser('maweiche@gmail.com', 'writer123');
  if (!auth) {
    console.error('❌ Authentication failed');
    process.exit(1);
  }
  console.log('✅ Authenticated as:', auth.user.email);
  const token = auth.token;

  // Step 2: Create conversation
  console.log('\nStep 2: Creating conversation...');
  const conversationRes = await fetch(`${API_BASE}/conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      sport: 'football',
      homeTeam: 'Wake Forest',
      awayTeam: 'Chapel Hill',
      gameDate: new Date().toISOString(),
      location: 'Wake Forest High School',
    }),
  });

  if (!conversationRes.ok) {
    console.error('❌ Failed to create conversation:', await conversationRes.text());
    process.exit(1);
  }

  const { conversation } = await conversationRes.json();
  console.log('✅ Created conversation:', conversation.id);

  // Step 3: Send messages
  console.log('\nStep 3: Simulating conversation...');
  const messages = [
    'The final score was 42-28, Wake Forest won',
    'Wake Forest came out strong in the first quarter, scoring 14 unanswered points',
    'Their quarterback, Marcus Johnson, had an incredible game with 312 passing yards and 4 touchdowns',
    'The key play was a 65-yard touchdown pass in the third quarter that sealed the game',
    'The atmosphere was electric with a packed home crowd',
  ];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    console.log(`  Sending message ${i + 1}/${messages.length}...`);

    const msgRes = await fetch(`${API_BASE}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversationId: conversation.id,
        message: msg,
      }),
    });

    if (!msgRes.ok) {
      console.error('❌ Failed to send message:', await msgRes.text());
      process.exit(1);
    }

    const { message: aiResponse, turnCount } = await msgRes.json();
    console.log(`  AI: ${aiResponse.substring(0, 60)}...`);
    console.log(`  Turn count: ${turnCount}`);
  }

  console.log('✅ Conversation complete');

  // Step 4: Generate article
  console.log('\nStep 4: Generating article (this takes ~15-30 seconds)...');
  const generateRes = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      conversationId: conversation.id,
    }),
  });

  if (!generateRes.ok) {
    console.error('❌ Failed to generate article:', await generateRes.text());
    process.exit(1);
  }

  const { article } = await generateRes.json();
  console.log('✅ Article generated!');
  console.log('\nHeadline:', article.headline);
  console.log('\nBody preview:', article.bodyMarkdown.substring(0, 200) + '...');

  // Step 5: Update article
  console.log('\nStep 5: Testing article update...');
  const updateRes = await fetch(`${API_BASE}/article`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: article.id,
      headline: article.headline + ' (Edited)',
    }),
  });

  if (!updateRes.ok) {
    console.error('❌ Failed to update article:', await updateRes.text());
    process.exit(1);
  }

  const { article: updated } = await updateRes.json();
  console.log('✅ Article updated');
  console.log('  Edit count:', updated.editCount);

  // Step 6: Publish article
  console.log('\nStep 6: Publishing article...');
  const publishRes = await fetch(`${API_BASE}/article`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: article.id,
      published: true,
    }),
  });

  if (!publishRes.ok) {
    console.error('❌ Failed to publish article:', await publishRes.text());
    process.exit(1);
  }

  const { article: published } = await publishRes.json();
  console.log('✅ Article published');
  console.log('  Published at:', published.publishedAt);

  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests passed!');
  console.log('='.repeat(50));
  console.log('\nPress Box AI is working! 🎉');
  console.log('\nNext steps:');
  console.log('  1. Build the frontend components');
  console.log('  2. Implement voice recorder');
  console.log('  3. Create conversation UI');
  console.log('  4. Add article editor\n');
}

testPressBoxAPI().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
