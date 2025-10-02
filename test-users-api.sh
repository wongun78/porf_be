#!/bin/bash

# Users API Test Script
# Make sure your Next.js server is running on localhost:3000

# Base URL
BASE_URL="http://localhost:3000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Users API Test Script ===${NC}"
echo ""

# First, we need to login to get a token
echo -e "${YELLOW}Step 1: Login to get authentication token${NC}"
echo "POST $BASE_URL/auth/login"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token from response (assuming jq is available)
if command -v jq &> /dev/null; then
  TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // empty')
  if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}Failed to get token. Please make sure you have a test user or register first.${NC}"
    echo -e "${YELLOW}You can register a test user first:${NC}"
    echo "curl -X POST $BASE_URL/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"username\":\"testuser\",\"password\":\"password123\"}'"
    exit 1
  fi
  echo -e "${GREEN}Token obtained: ${TOKEN:0:20}...${NC}"
else
  echo -e "${RED}jq not found. Please install jq or manually extract the token.${NC}"
  echo "You can install jq with: brew install jq (on macOS)"
  exit 1
fi

echo ""

# Test 1: Get all users
echo -e "${YELLOW}Step 2: Get all users (GET /api/users)${NC}"
curl -s -X GET "$BASE_URL/users?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""

# Test 2: Create a new user
echo -e "${YELLOW}Step 3: Create new user (POST /api/users)${NC}"
NEW_USER_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser123",
    "password": "newpassword123",
    "fullName": "New Test User"
  }')

echo $NEW_USER_RESPONSE | jq '.'

# Extract new user ID
NEW_USER_ID=$(echo $NEW_USER_RESPONSE | jq -r '.data._id // empty')

if [ -n "$NEW_USER_ID" ] && [ "$NEW_USER_ID" != "null" ]; then
  echo -e "${GREEN}New user created with ID: $NEW_USER_ID${NC}"
  
  echo ""
  
  # Test 3: Get specific user
  echo -e "${YELLOW}Step 4: Get specific user (GET /api/users/$NEW_USER_ID)${NC}"
  curl -s -X GET "$BASE_URL/users/$NEW_USER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | jq '.'
  
  echo ""
  
  # Test 4: Update user
  echo -e "${YELLOW}Step 5: Update user (PUT /api/users/$NEW_USER_ID)${NC}"
  curl -s -X PUT "$BASE_URL/users/$NEW_USER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "fullName": "Updated Test User",
      "isActive": true
    }' | jq '.'
  
  echo ""
  
  # Test 5: Delete user
  echo -e "${YELLOW}Step 6: Delete user (DELETE /api/users/$NEW_USER_ID)${NC}"
  curl -s -X DELETE "$BASE_URL/users/$NEW_USER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | jq '.'
  
  echo ""
  
  # Test 6: Try to get deleted user (should return 404)
  echo -e "${YELLOW}Step 7: Try to get deleted user (should return 404)${NC}"
  curl -s -X GET "$BASE_URL/users/$NEW_USER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | jq '.'
  
else
  echo -e "${RED}Failed to create new user or extract user ID${NC}"
fi

echo ""
echo -e "${GREEN}=== Test completed ===${NC}"
echo ""
echo -e "${YELLOW}Additional test scenarios you can try:${NC}"
echo "1. Search users: curl -X GET '$BASE_URL/users?search=john' -H 'Authorization: Bearer $TOKEN'"
echo "2. Filter active users: curl -X GET '$BASE_URL/users?active=true' -H 'Authorization: Bearer $TOKEN'"
echo "3. Sort users: curl -X GET '$BASE_URL/users?sort=username&order=asc' -H 'Authorization: Bearer $TOKEN'"
echo "4. Test validation errors: curl -X POST '$BASE_URL/users' -H 'Authorization: Bearer $TOKEN' -d '{\"email\":\"invalid-email\"}'"