#!/bin/bash

# Check if the server/.env file exists
if [ -f "server/.env" ]; then
  # Copy the file to the root directory
  cp server/.env .env
  echo "✓ .env file copied to root directory"
  
  # Remove the original file
  rm server/.env
  echo "✓ Original server/.env file removed"
else
  echo "Error: server/.env file not found"
  exit 1
fi

echo "Done! The .env file has been moved to the root directory."
