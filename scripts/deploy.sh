#!/bin/bash

# Deployment script for Web Scraping UI
set -e

# Configuration
ENVIRONMENT=${1:-staging}
BUILD_DIR="dist"
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"

echo "🚀 Starting deployment for environment: $ENVIRONMENT"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo "❌ Invalid environment. Use: development, staging, or production"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --silent

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Type check
echo "🔍 Type checking..."
npm run type-check

# Lint code
echo "🔧 Linting code..."
npm run lint

# Build application
echo "🏗️  Building application for $ENVIRONMENT..."
case $ENVIRONMENT in
    "development")
        npm run build
        ;;
    "staging")
        npm run build:staging
        ;;
    "production")
        npm run build:production
        ;;
esac

# Verify build
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build failed - $BUILD_DIR directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Optional: Deploy to server (uncomment and configure as needed)
# if [ "$ENVIRONMENT" = "production" ]; then
#     echo "🌐 Deploying to production server..."
#     rsync -avz --delete $BUILD_DIR/ user@server:/var/www/html/
# elif [ "$ENVIRONMENT" = "staging" ]; then
#     echo "🌐 Deploying to staging server..."
#     rsync -avz --delete $BUILD_DIR/ user@staging-server:/var/www/html/
# fi

# Optional: Invalidate CDN cache
# if [ "$ENVIRONMENT" = "production" ]; then
#     echo "🔄 Invalidating CDN cache..."
#     aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
# fi

echo "🎉 Deployment completed successfully!"
echo "📊 Build size:"
du -sh $BUILD_DIR

# Show build artifacts
echo "📁 Build artifacts:"
find $BUILD_DIR -name "*.js" -o -name "*.css" | head -10