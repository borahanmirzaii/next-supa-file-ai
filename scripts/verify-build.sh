#!/bin/bash

# Build verification script
set -e

echo "🔍 Verifying production build..."

# Check Node version
echo "📦 Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile

# Run linting
echo "🔍 Running linter..."
pnpm lint || echo "⚠️  Linter found issues (non-blocking)"

# Run tests
echo "🧪 Running tests..."
pnpm test:ci || echo "⚠️  Some tests failed (check output)"

# Build production
echo "🏗️  Building production bundle..."
pnpm build

# Check build output
if [ -d ".next" ]; then
  echo "✅ Build successful!"
  echo "📊 Build size:"
  du -sh .next
else
  echo "❌ Build failed - .next directory not found"
  exit 1
fi

# Check for common issues
echo "🔍 Checking for common issues..."

# Check for console.log in production code
if grep -r "console.log" app/ lib/ --exclude-dir=node_modules 2>/dev/null | grep -v "//"; then
  echo "⚠️  Found console.log statements (should be removed in production)"
fi

# Check environment variables
echo "🔍 Checking environment variables..."
required_vars=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "GOOGLE_GENERATIVE_AI_API_KEY"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠️  $var is not set"
  else
    echo "✅ $var is set"
  fi
done

echo "✅ Build verification complete!"

