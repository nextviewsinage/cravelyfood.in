#!/bin/bash

echo "Testing Django Login Endpoint..."
echo ""

curl -X POST http://127.0.0.1:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}' \
  -v

echo ""
echo ""
echo "Test completed!"
