#!/bin/bash

API_URL="http://localhost:3000/sites/jerkstore/api/generate-insult"
API_KEY=$1

if [ -z "$API_KEY" ]; then
  echo "Usage: ./test-api.sh <YOUR_API_KEY>"
  exit 1
fi

echo "Testing Jerkstore API with Key: $API_KEY"
echo "URL: $API_URL"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "topic": "testing the api key",
    "heatLevel": "spicy",
    "language": "English"
  }'

echo -e "\n\nDone."
