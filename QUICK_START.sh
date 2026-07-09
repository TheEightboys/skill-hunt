#!/bin/bash

# Event Management System - Quick Start Script
# This script sets up the event management system

echo "🚀 Skill Hunt - Event Management System Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo -e "${BLUE}Step 1: Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo ""

# Step 2: Install dependencies (if needed)
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Step 3: Database migration
echo -e "${BLUE}Step 3: Running database migration...${NC}"
echo -e "${YELLOW}⚠️  Make sure your database is running and .env is configured${NC}"
read -p "Continue with database migration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:push
    echo -e "${GREEN}✓ Database migration complete${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping migration - you'll need to run it manually later${NC}"
fi
echo ""

# Step 4: Build project
echo -e "${BLUE}Step 4: Building project...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo "❌ Build failed. Please check for errors."
    exit 1
fi
echo ""

# Step 5: Start development server
echo -e "${BLUE}Step 5: Starting development server...${NC}"
echo -e "${YELLOW}Development server will start on http://localhost:5173${NC}"
echo ""
echo "Quick Access URLs:"
echo "  • Home:            http://localhost:5173"
echo "  • Events:          http://localhost:5173/events"
echo "  • Dashboard:       http://localhost:5173/dashboard"
echo "  • Admin:           http://localhost:5173/admin"
echo "  • Faculty Portal:  http://localhost:5173/faculty"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

npm run dev
