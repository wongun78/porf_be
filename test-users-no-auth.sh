#!/bin/bash

# Users API Test Script - No Authentication Required
# Make sure your Next.js server is running on localhost:3000

# Base URL
BASE_URL="http://localhost:3000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Users API Test Script (No Auth) ===${NC}"
echo ""

# Test 1: Get all users
echo -e "${YELLOW}Step 1: Get all users (GET /api/users)${NC}"
curl -s -X GET "$BASE_URL/users?page=1&limit=5" \
  -H "Content-Type: application/json" | jq '.'

echo ""

# Test 2: Create a new user
echo -e "${YELLOW}Step 2: Create new user (POST /api/users)${NC}"
NEW_USER_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "username": "testuser123",
    "password": "password123",
    "fullName": "Test User"
  }')

echo $NEW_USER_RESPONSE | jq '.'

# Extract new user ID
if command -v jq &> /dev/null; then
  NEW_USER_ID=$(echo $NEW_USER_RESPONSE | jq -r '.data._id // empty')
  if [ -n "$NEW_USER_ID" ] && [ "$NEW_USER_ID" != "null" ]; then
    echo -e "${GREEN}New user created with ID: $NEW_USER_ID${NC}"
    
    echo ""
    
    # Test 3: Get specific user by ID
    echo -e "${YELLOW}Step 3: Get specific user (GET /api/users/$NEW_USER_ID)${NC}"
    curl -s -X GET "$BASE_URL/users/$NEW_USER_ID" \
      -H "Content-Type: application/json" | jq '.'
    
    echo ""
    
    # Test 4: Update user using query parameter
    echo -e "${YELLOW}Step 4: Update user using query parameter (PUT /api/users?id=xxx)${NC}"
    curl -s -X PUT "$BASE_URL/users?id=$NEW_USER_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "fullName": "Updated Test User",
        "isActive": true
      }' | jq '.'
    
    echo ""
    
    # Test 5: Update user using request body
    echo -e "${YELLOW}Step 5: Update user using request body (PUT /api/users)${NC}"
    curl -s -X PUT "$BASE_URL/users" \
      -H "Content-Type: application/json" \
      -d '{
        "id": "'$NEW_USER_ID'",
        "fullName": "Updated Again Test User",
        "avatar": "https://example.com/avatar.jpg"
      }' | jq '.'
    
    echo ""
    
    # Test 6: Update user via [id] route
    echo -e "${YELLOW}Step 6: Update user via [id] route (PUT /api/users/$NEW_USER_ID)${NC}"
    curl -s -X PUT "$BASE_URL/users/$NEW_USER_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "fullName": "Final Update Test User"
      }' | jq '.'
    
    echo ""
    
    # Test 7: Delete user using query parameter
    echo -e "${YELLOW}Step 7: Delete user using query parameter (DELETE /api/users?id=xxx)${NC}"
    curl -s -X DELETE "$BASE_URL/users?id=$NEW_USER_ID" \
      -H "Content-Type: application/json" | jq '.'
    
    echo ""
    
    # Test 8: Try to get deleted user (should return 404)
    echo -e "${YELLOW}Step 8: Try to get deleted user (should return 404)${NC}"
    curl -s -X GET "$BASE_URL/users/$NEW_USER_ID" \
      -H "Content-Type: application/json" | jq '.'
    
  else
    echo -e "${RED}Failed to create new user or extract user ID${NC}"
  fi
else
  echo -e "${RED}jq not found. Please install jq: brew install jq (on macOS)${NC}"
fi

echo ""

# Create another user for additional tests
echo -e "${YELLOW}Step 9: Create another user for testing different delete method${NC}"
NEW_USER_RESPONSE2=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser2@example.com",
    "username": "testuser456",
    "password": "password456",
    "fullName": "Test User 2"
  }')

echo $NEW_USER_RESPONSE2 | jq '.'

if command -v jq &> /dev/null; then
  NEW_USER_ID2=$(echo $NEW_USER_RESPONSE2 | jq -r '.data._id // empty')
  if [ -n "$NEW_USER_ID2" ] && [ "$NEW_USER_ID2" != "null" ]; then
    echo -e "${GREEN}Second user created with ID: $NEW_USER_ID2${NC}"
    
    echo ""
    
    # Test 10: Delete user using request body
    echo -e "${YELLOW}Step 10: Delete user using request body (DELETE /api/users)${NC}"
    curl -s -X DELETE "$BASE_URL/users" \
      -H "Content-Type: application/json" \
      -d '{
        "id": "'$NEW_USER_ID2'"
      }' | jq '.'
    
    echo ""
    
    # Test 11: Delete user via [id] route
    echo -e "${YELLOW}Step 11: Create and delete user via [id] route${NC}"
    
    # Create third user
    NEW_USER_RESPONSE3=$(curl -s -X POST "$BASE_URL/users" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "testuser3@example.com",
        "username": "testuser789",
        "password": "password789",
        "fullName": "Test User 3"
      }')
    
    NEW_USER_ID3=$(echo $NEW_USER_RESPONSE3 | jq -r '.data._id // empty')
    echo -e "${GREEN}Third user created with ID: $NEW_USER_ID3${NC}"
    
    # Delete via [id] route
    curl -s -X DELETE "$BASE_URL/users/$NEW_USER_ID3" \
      -H "Content-Type: application/json" | jq '.'
  fi
fi

echo ""
echo -e "${GREEN}=== Test completed ===${NC}"
echo ""
echo -e "${YELLOW}Additional test scenarios you can try:${NC}"
echo "1. Search users: curl -X GET '$BASE_URL/users?search=test'"
echo "2. Filter active users: curl -X GET '$BASE_URL/users?active=true'"
echo "3. Sort users: curl -X GET '$BASE_URL/users?sort=username&order=asc'"
echo "4. Test validation errors: curl -X POST '$BASE_URL/users' -d '{\"email\":\"invalid-email\"}'"
echo ""
echo -e "${YELLOW}Available update/delete methods:${NC}"
echo "UPDATE methods:"
echo "  - PUT /api/users?id=USER_ID (query parameter)"
echo "  - PUT /api/users (with id in request body)"
echo "  - PUT /api/users/USER_ID ([id] route)"
echo ""
echo "DELETE methods:"
echo "  - DELETE /api/users?id=USER_ID (query parameter)"
echo "  - DELETE /api/users (with id in request body)"
echo "  - DELETE /api/users/USER_ID ([id] route)"