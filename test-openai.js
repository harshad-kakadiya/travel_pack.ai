#!/usr/bin/env node
/**
 * Direct OpenAI API Test Script
 * 
 * Usage:
 *   node test-openai.js
 * 
 * Make sure to set VITE_OPENAI_API_KEY in your .env file or as an environment variable
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

// Call OpenAI API directly
async function callOpenAI(prompt, options = {}) {
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY not found in environment variables');
  }

  const {
    model = 'gpt-4o',
    maxTokens = 1000,
    temperature = 0.7,
    responseFormat = 'text'
  } = options;

  const requestBody = {
    model,
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: maxTokens,
    temperature,
  };

  if (responseFormat === 'json') {
    requestBody.response_format = { type: 'json_object' };
  }

  console.log('📤 Calling OpenAI API...');
  console.log(`   Model: ${model}`);
  console.log(`   Max Tokens: ${maxTokens}`);
  console.log(`   Temperature: ${temperature}`);
  console.log('');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  
  console.log('✅ Response received!');
  console.log(`   Tokens used: ${data.usage.total_tokens} (prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`);
  console.log('');

  return data.choices[0]?.message?.content || '';
}

// Test examples
async function runTests() {
  console.log('🚀 OpenAI API Direct Call Test\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Load environment variables
    loadEnv();

    // Test 1: Simple text completion
    console.log('📝 Test 1: Simple Text Completion');
    console.log('Prompt: "Write a short haiku about traveling to Japan"');
    console.log('-'.repeat(60));
    
    const result1 = await callOpenAI(
      'Write a short haiku about traveling to Japan',
      { maxTokens: 100, temperature: 0.8 }
    );
    
    console.log('Response:');
    console.log(result1);
    console.log('');
    console.log('='.repeat(60));
    console.log('');

    // Test 2: JSON output
    console.log('📝 Test 2: JSON Output');
    console.log('Prompt: "List 3 must-see places in Paris. Output as JSON with format: {"places": [{"name": "...", "description": "..."}]}"');
    console.log('-'.repeat(60));
    
    const result2 = await callOpenAI(
      'List 3 must-see places in Paris. Output as JSON with format: {"places": [{"name": "...", "description": "..."}]}',
      { maxTokens: 500, temperature: 0.7, responseFormat: 'json' }
    );
    
    console.log('Response:');
    console.log(JSON.stringify(JSON.parse(result2), null, 2));
    console.log('');
    console.log('='.repeat(60));
    console.log('');

    // Test 3: Travel brief snippet
    console.log('📝 Test 3: Travel Brief Snippet');
    console.log('Prompt: Generate a one-day itinerary for Tokyo...');
    console.log('-'.repeat(60));
    
    const result3 = await callOpenAI(
      `Generate a one-day itinerary for Tokyo for a first-time traveler.
Include 3-4 activities with time slots, descriptions, and cost estimates.
Output as JSON with format: {"day": 1, "activities": [{"time": "...", "title": "...", "description": "...", "cost": "..."}]}`,
      { maxTokens: 800, temperature: 0.7, responseFormat: 'json' }
    );
    
    console.log('Response:');
    console.log(JSON.stringify(JSON.parse(result3), null, 2));
    console.log('');
    console.log('='.repeat(60));
    console.log('');

    console.log('✨ All tests completed successfully!');
    console.log('');
    console.log('💡 Tips:');
    console.log('   - To use in your app, import from src/lib/openai.ts');
    console.log('   - For production, use Supabase Edge Functions to keep API key secure');
    console.log('   - Current setup: supabase/functions/generate-travel-brief/index.ts');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Make sure VITE_OPENAI_API_KEY is set in your .env file');
    console.error('   2. Check that your API key is valid');
    console.error('   3. Verify you have API credits in your OpenAI account');
    console.error('');
    process.exit(1);
  }
}

// Run tests
runTests();
