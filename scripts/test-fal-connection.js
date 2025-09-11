#!/usr/bin/env node

import { fal } from '@fal-ai/client';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configure FAL AI client
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY,
  });
  console.log('FAL AI client configured with API key');
} else {
  console.log('No FAL_KEY found in environment variables');
  process.exit(1);
}

// Test connection with a simple request
async function testConnection() {
  try {
    console.log('Testing FAL AI connection...');

    const result = await fal.subscribe('fal-ai/imagen3/fast', {
      input: {
        prompt: 'A simple test image',
        aspect_ratio: '16:9',
        num_images: 1,
        resolution: '1K',
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('Connection successful!');
    console.log('Result:', result.data);
    console.log('Request ID:', result.requestId);
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
