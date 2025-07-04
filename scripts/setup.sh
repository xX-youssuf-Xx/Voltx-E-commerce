#!/bin/bash

# VoltX E-commerce Setup Script

set -e

echo "🔧 Setting up VoltX E-commerce development environment..."

# Create directories
echo "📁 Creating directory structure..."
mkdir -p docker/{nginx,postgres,elasticsearch}
mkdir -p backend frontend scripts .github/workflows

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your actual values"
fi

# Build and start development environment
echo "🐳 Building Docker containers..."
docker-compose build

echo "🚀 Starting development environment..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
docker-compose ps

echo "✅ VoltX E-commerce setup complete!"
echo ""
echo "🌐 Access your application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  Nginx: http://localhost"
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
echo "  Elasticsearch: http://localhost:9200"
echo ""
echo "📊 To monitor logs:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 To stop services:"
echo "  docker-compose down"