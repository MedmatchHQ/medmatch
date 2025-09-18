#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Running Job Postings Module Tests${NC}"
echo "=================================="

# Change to server directory
cd "$(dirname "$0")"

echo -e "\n${YELLOW}📋 Running Job Posting Integration Tests...${NC}"
npm test -- --testPathPattern="job-postings.*integration" --verbose

echo -e "\n${YELLOW}🔧 Running Job Posting Unit Tests...${NC}"
npm test -- --testPathPattern="job-postings.*unit" --verbose

echo -e "\n${YELLOW}🏢 Running Professional Profile Job Posting Tests...${NC}"
npm test -- --testPathPattern="professional-profile-job-posting" --verbose

echo -e "\n${GREEN}✅ All Job Posting Tests Completed!${NC}"
