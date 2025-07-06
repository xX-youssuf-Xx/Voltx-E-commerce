#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting VoltX Main Frontend Build Process...');

// Clean dist directory
console.log('🧹 Cleaning dist directory...');
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}

// Build with Vite
console.log('🔨 Building with Vite...');
try {
  execSync('bun run build', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Vite build completed successfully!');
} catch (error) {
  console.error('❌ Vite build failed:', error.message);
  process.exit(1);
}

// Create a simple serve script for production
const serveScript = `#!/usr/bin/env node
// VoltX Main Frontend Production Serve Script
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`🚀 VoltX Main Store running on port \${PORT}\`);
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

console.log('\n🎉 Main Frontend Build completed successfully!');
console.log('📁 Output directory: ./dist');
console.log('🚀 To run in production:');
console.log('   cd dist');
console.log('   bun install --production');
console.log('   bun run start');
console.log('\n📋 Build summary:');
console.log('   ✅ TypeScript compiled to JavaScript');
console.log('   ✅ Code optimized for production');
console.log('   ✅ Static files generated');
console.log('   ✅ Serve script created');
console.log('   ✅ Production package.json created'); 