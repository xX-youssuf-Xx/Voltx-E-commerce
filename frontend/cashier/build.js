#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting VoltX Cashier Frontend Build Process...');

// Check if .env file exists, if not copy from env.example
if (!fs.existsSync('./.env') && fs.existsSync('./env.example')) {
  console.log('📋 Copying env.example to .env...');
  fs.copyFileSync('./env.example', './.env');
  console.log('✅ Environment file created!');
}

// Clean dist directory
console.log('🧹 Cleaning dist directory...');
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}

// Build with Vite
console.log('🔨 Building with Vite...');
try {
  execSync('bun run vite', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Vite build completed successfully!');
} catch (error) {
  console.error('❌ Vite build failed:', error.message);
  process.exit(1);
}

// Copy environment template to dist
console.log('📋 Copying environment template...');
if (fs.existsSync('./env.example')) {
  fs.copyFileSync('./env.example', './dist/env.example');
  console.log('✅ Environment template copied!');
}

// Create a simple serve script for production
const serveScript = `#!/usr/bin/env node
// VoltX Cashier Frontend Production Serve Script
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`🚀 VoltX Cashier running on port \${PORT}\`);
  console.log(\`📁 Serving files from: \${path.join(__dirname, 'dist')}\`);
});
`;

fs.writeFileSync('./dist/serve.js', serveScript);
console.log('✅ Serve script created!');

// Create production package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const productionPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  scripts: {
    start: "node serve.js",
    serve: "node serve.js"
  },
  dependencies: {
    express: "^4.18.2"
  }
};

fs.writeFileSync('./dist/package.json', JSON.stringify(productionPackageJson, null, 2));
console.log('✅ Production package.json created!');

console.log('\n🎉 Cashier Frontend Build completed successfully!');
console.log('📁 Output directory: ./dist');
console.log('🚀 To run in production:');
console.log('   cd dist');
console.log('   bun install --production');
console.log('   bun run start');
console.log('\n📋 Build summary:');
console.log('   ✅ TypeScript compiled to JavaScript');
console.log('   ✅ Code optimized for production');
console.log('   ✅ Environment variables configured');
console.log('   ✅ Static files generated');
console.log('   ✅ Serve script created');
console.log('   ✅ Production package.json created'); 