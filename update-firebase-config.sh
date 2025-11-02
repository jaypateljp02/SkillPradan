#!/bin/bash

# This script updates the firebase-config.ts file with actual environment variables
CONFIG_FILE="client/src/lib/firebase-config.ts"

# Make a backup of the original file
cp "$CONFIG_FILE" "${CONFIG_FILE}.bak"

# Replace placeholders with actual environment variables
sed -i "s|__FIREBASE_API_KEY__|$FIREBASE_API_KEY|g" "$CONFIG_FILE"
sed -i "s|__FIREBASE_AUTH_DOMAIN__|$FIREBASE_AUTH_DOMAIN|g" "$CONFIG_FILE"
sed -i "s|__FIREBASE_PROJECT_ID__|$FIREBASE_PROJECT_ID|g" "$CONFIG_FILE"
sed -i "s|__FIREBASE_STORAGE_BUCKET__|$FIREBASE_STORAGE_BUCKET|g" "$CONFIG_FILE"
sed -i "s|__FIREBASE_MESSAGING_SENDER_ID__|$FIREBASE_MESSAGING_SENDER_ID|g" "$CONFIG_FILE"
sed -i "s|__FIREBASE_APP_ID__|$FIREBASE_APP_ID|g" "$CONFIG_FILE"

echo "Firebase configuration updated in $CONFIG_FILE"
