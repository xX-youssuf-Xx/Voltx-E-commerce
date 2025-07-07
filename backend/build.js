#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting VoltX Backend Build Process...');

// Clean dist directory
console.log('🧹 Cleaning dist directory...');
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync('./dist', { recursive: true });

// Build with Bun
console.log('🔨 Building with Bun...');
try {
  execSync('bun build src/server.ts --outdir=dist --target=bun --minify', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Bun build completed successfully!');
} catch (error) {
  console.error('❌ Bun build failed:', error.message);
  process.exit(1);
}

// Ensure uploads directory exists and copy if it has content
console.log('📁 Setting up uploads directory...');
const uploadsDir = path.join(process.cwd(), 'uploads');
const distUploadsDir = path.join(process.cwd(), 'dist', 'uploads');

// Create uploads directory in dist
if (!fs.existsSync(distUploadsDir)) {
  fs.mkdirSync(distUploadsDir, { recursive: true });
  console.log('✅ Created uploads directory in dist');
}

// Copy existing uploads if they exist
if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  if (files.length > 0) {
    fs.cpSync(uploadsDir, distUploadsDir, { recursive: true });
    console.log(`✅ Copied ${files.length} files from uploads directory`);
  } else {
    console.log('ℹ️  Uploads directory exists but is empty');
  }
} else {
  console.log('ℹ️  Uploads directory not found, created empty one');
}

// Copy package.json for production dependencies
console.log('📦 Copying package.json...');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const productionPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  main: packageJson.main,
  scripts: {
    start: packageJson.scripts.start,
    preview: packageJson.scripts.preview
  },
  dependencies: packageJson.dependencies
};

fs.writeFileSync('./dist/package.json', JSON.stringify(productionPackageJson, null, 2));
console.log('✅ Package.json copied!');

// Copy env.example if it exists
console.log('🔧 Copying environment files...');
if (fs.existsSync('./env.example')) {
  fs.copyFileSync('./env.example', './dist/.env.example');
  console.log('✅ env.example copied!');
}

// Create a simple start script
const startScript = `#!/usr/bin/env bun
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
`;

fs.writeFileSync('./dist/start.js', startScript);
console.log('✅ Start script created!');

// Make start script executable (Unix-like systems)
try {
  fs.chmodSync('./dist/start.js', '755');
} catch (error) {
  // Windows doesn't support chmod, so we ignore this error
}

console.log('\n🎉 Build completed successfully!');
console.log('📁 Output directory: ./dist');
console.log('🚀 To run in production:');
console.log('   cd dist');
console.log('   bun install --production');
console.log('   bun run start');
console.log('\n📋 Build summary:');
console.log('   ✅ TypeScript compiled to JavaScript');
console.log('   ✅ Code minified for production');
console.log('   ✅ Uploads directory copied');
console.log('   ✅ Package.json optimized for production');
console.log('   ✅ Environment files copied');
console.log('   ✅ Start script created'); 