#!/bin/bash

# Default email address and API token
DEFAULT_EMAIL=""
DEFAULT_CIRCLECI_TOKEN=""

# Prompt for user email address with the default value
read -p "Enter your email address [Default: $DEFAULT_EMAIL]: " EMAIL
EMAIL=${EMAIL:-$DEFAULT_EMAIL}

# Prompt for API token with the default value
read -p "Enter your CircleCI API Token [Default: $DEFAULT_CIRCLECI_TOKEN]: " CIRCLECI_TOKEN
CIRCLECI_TOKEN=${CIRCLECI_TOKEN:-$DEFAULT_CIRCLECI_TOKEN}

# Check if email and API token are provided
if [ -z "$EMAIL" ] || [ -z "$CIRCLECI_TOKEN" ]; then
  echo "Error: Email address and CircleCI API Token are required."
  exit 1
fi

# Run the fastlane command and capture its output
echo "yes" | fastlane spaceauth -u "$EMAIL"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq is not installed. Installing..."
    # Install jq using the package manager (apt-get for Debian-based systems)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y jq
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install jq
    else
        echo "Unsupported OS. Please install jq manually."
        exit 1
    fi
fi

# Get the value from the clipboard and assign it to a variable
clipboard_content=$(pbpaste)

# Escape backslashes and newlines in the parsed string
FASTLANE_SESSION=$(echo "$clipboard_content" | sed -e ':a' -e 'N' -e '$!ba' -e 's/\\/\\\\/g' -e 's/\n/\\n/g')

# Use jq to create the JSON payload
json_payload=$(jq -n --arg value "$FASTLANE_SESSION" '{"value": $value}')

echo "JSON payload: $json_payload"

# Define other variables
CONTEXT_ID="f4c838ab-74bf-477c-9d74-d5efdff284c4"
echo "CONTEXT_ID: $CONTEXT_ID"

ENV_VAR_NAME="FASTLANE_SESSION"

# Make the API request
curl -X PUT \
  --url "https://circleci.com/api/v2/context/${CONTEXT_ID}/environment-variable/${ENV_VAR_NAME}" \
  -H "Circle-Token: ${CIRCLECI_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$json_payload"

