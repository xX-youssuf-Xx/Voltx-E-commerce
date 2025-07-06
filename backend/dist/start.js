#!/usr/bin/env bun
// VoltX Backend Production Start Script
console.log('🚀 Starting VoltX Backend in production mode...');
console.log('📁 Working directory:', process.cwd());
console.log('🔧 Environment:', process.env.NODE_ENV || 'development');

// Import and start the server
import('./server.js').then(module => {
  console.log('✅ Server module loaded successfully!');
}).catch(error => {
  console.error('❌ Failed to load server module:', error);
  process.exit(1);
});
