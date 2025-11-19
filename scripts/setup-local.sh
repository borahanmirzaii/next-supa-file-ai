#!/bin/bash

# Complete Local Setup Script
# This script sets up everything needed for local development

set -e

echo "🔧 Setting up Local Development Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}Installing pnpm...${NC}"
    npm install -g pnpm
fi

if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}Installing Supabase CLI...${NC}"
    npm install -g supabase
fi

if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}❌ Docker/OrbStack is not running. Please start it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local from template...${NC}"
    if [ -f .env.local.template ]; then
        cp .env.local.template .env.local
        echo -e "${GREEN}✅ .env.local created from template${NC}"
    else
        # Fallback: create from scratch
        cat > .env.local << 'EOF'
# Local Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDoEIiDueJYRFcZ_3bPj7HgyDTMSdQXoIQ

# Redis
REDIS_URL=redis://localhost:6379
EOF
        echo -e "${GREEN}✅ .env.local created${NC}"
    fi
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi
echo ""

# Start Supabase
echo -e "${BLUE}Starting Supabase...${NC}"
if supabase status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Supabase is already running${NC}"
else
    supabase start
    echo -e "${GREEN}✅ Supabase started${NC}"
fi
echo ""

# Apply migrations
echo -e "${BLUE}Applying database migrations...${NC}"
supabase db reset
echo -e "${GREEN}✅ Migrations applied${NC}"
echo ""

# Start Redis
echo -e "${BLUE}Starting Redis...${NC}"
docker-compose -f docker-compose.local.yml up -d redis
echo -e "${GREEN}✅ Redis started${NC}"
echo ""

# Create storage bucket
echo -e "${BLUE}Creating storage bucket...${NC}"
echo -e "${YELLOW}Please create 'user-files' bucket manually:${NC}"
echo "  1. Open: http://127.0.0.1:54323"
echo "  2. Go to Storage → Buckets"
echo "  3. Click 'New bucket'"
echo "  4. Name: user-files"
echo "  5. Public: No"
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "  1. Create storage bucket (see above)"
echo "  2. Start dev server: pnpm dev"
echo "  3. Visit: http://localhost:3000"
echo ""

