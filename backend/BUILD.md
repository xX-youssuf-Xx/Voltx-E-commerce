# VoltX Backend Build Guide

This guide explains how to build the VoltX backend for production deployment.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
bun install

# Start development server with hot reload
bun run dev

# Type checking
bun run type-check
```

### Production Build

#### Option 1: Simple Build (Recommended)
```bash
# Build the application
bun run build

# Start production server
bun run start
```

#### Option 2: Full Build (Includes all assets)
```bash
# Full build with assets
bun run build:full

# Start production server
bun run start
```

#### Option 3: Production Build
```bash
# Production build with environment
bun run build:prod

# Start production server
bun run start
```

## 📁 Build Output

The build process creates a `dist/` directory containing:

```
dist/
├── server.js          # Main application bundle
├── package.json       # Production dependencies
├── start.js          # Production start script
├── uploads/          # Uploads directory (copied)
└── .env.example      # Environment template (if exists)
```

## 🔧 Build Scripts

| Script | Description |
|--------|-------------|
| `bun run build` | Simple build with Bun bundler |
| `bun run build:full` | Full build with assets and configuration |
| `bun run build:prod` | Production build with NODE_ENV=production |
| `bun run build:clean` | Clean build (removes dist first) |
| `bun run build:tsc` | TypeScript compilation only |
| `bun run start` | Start production server |
| `bun run preview` | Preview production build |
| `bun run dev` | Development server with hot reload |
| `bun run type-check` | TypeScript type checking |
| `bun run lint` | Lint code with TypeScript |

## 🚀 Deployment

### Local Production Testing
```bash
# Build the application
bun run build:prod

# Navigate to dist directory
cd dist

# Install production dependencies
bun install --production

# Start the server
bun run start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t voltx-backend .

# Run container
docker run -p 3005:3005 voltx-backend
```

### Environment Variables

Create a `.env` file in the `dist/` directory:

```env
NODE_ENV=production
PORT=3005
DATABASE_URL=postgresql://user:password@localhost:5432/voltx
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

## 📦 Build Process Details

### 1. TypeScript Compilation
- Compiles TypeScript to JavaScript
- Generates source maps for debugging
- Creates type declarations

### 2. Bundling
- Bundles all dependencies into a single file
- Minifies code for production
- Optimizes for Bun runtime

### 3. Asset Copying
- Copies `uploads/` directory
- Copies environment templates
- Creates production package.json

### 4. Optimization
- Removes development dependencies
- Minifies JavaScript code
- Generates optimized bundle

## 🔍 Troubleshooting

### Build Errors
```bash
# Check TypeScript errors
bun run type-check

# Clean and rebuild
bun run build:clean
```

### Runtime Errors
```bash
# Check logs
tail -f logs/app.log

# Verify environment variables
cat .env
```

### Performance Issues
```bash
# Monitor memory usage
bun --inspect dist/server.js

# Check bundle size
ls -lh dist/server.js
```

## 📊 Build Statistics

After a successful build, you'll see:

```
🎉 Build completed successfully!
📁 Output directory: ./dist
📋 Build summary:
   ✅ TypeScript compiled to JavaScript
   ✅ Code minified for production
   ✅ Uploads directory copied
   ✅ Package.json optimized for production
   ✅ Environment files copied
   ✅ Start script created
```

## 🔄 Continuous Integration

For CI/CD pipelines, use:

```yaml
# Example GitHub Actions
- name: Build Backend
  run: |
    cd backend
    bun install
    bun run build:prod
```

## 📝 Notes

- The build process uses Bun's bundler for optimal performance
- All TypeScript types are preserved for better debugging
- Source maps are generated for production debugging
- The uploads directory is preserved for file storage
- Environment variables should be configured for production 