#!/bin/bash

# VoltX E-commerce Deployment Script

set -e

echo "🚀 Starting VoltX E-commerce deployment..."

# Custom deployment trigger
trigger_deployment() {
    echo "📡 Triggering deployment via GitHub API..."
    
    curl -X POST \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/repos/xX-youssuf-Xx/Voltx-E-commerce/dispatches \
        -d '{"event_type":"deploy-production"}'
    
    echo "✅ Deployment triggered successfully!"
}

# Check if GitHub token is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable is not set"
    echo "Please set your GitHub Personal Access Token:"
    echo "export GITHUB_TOKEN=your_token_here"
    exit 1
fi

# Trigger deployment
trigger_deployment

echo "🎉 Deployment process initiated!"
echo "Check the Actions tab in your GitHub repository for progress."