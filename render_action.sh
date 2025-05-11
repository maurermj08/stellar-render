#!/bin/bash

# Get the environment variables
source .env.local

# Install Remotion dependencies if needed
echo "Checking and installing Remotion dependencies..."
npm install @remotion/compositor-linux-x64-gnu @remotion/compositor-linux-x64-musl

# Check if the installation was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to install Remotion dependencies"
    exit 1
fi

# Check required environment variables
if [[ -z "$SERVICE_ROLE_KEY" ]]; then
    echo "Error: SERVICE_ROLE_KEY is not set"
    exit 1
fi

if [[ -z "$PUBLIC_SUPABASE_URL" ]]; then
    echo "Error: PUBLIC_SUPABASE_URL is not set"
    exit 1
fi

# Your table names
RENDER_TABLE_NAME="renders"

# Query parameters (optional)
RENDER_QUERY_PARAMS="select=*&started_timestamp=is.null&limit=5"

# Make the API request to get pending renders
echo "Querying Supabase for pending renders..."
results=$(curl -s -f -X GET \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  "${PUBLIC_SUPABASE_URL}/rest/v1/${RENDER_TABLE_NAME}?${RENDER_QUERY_PARAMS}")

# Check if curl request failed
if [[ $? -ne 0 ]]; then
    echo "Error: Failed to connect to Supabase API"
    exit 1
fi

# Check if results is empty or null
if [[ "$results" == "[]" || -z "$results" ]]; then
    echo "No pending renders found. Exiting successfully."
    exit 0
fi

# Check if results is valid JSON
if ! jq -e . >/dev/null 2>&1 <<< "$results"; then
    echo "Error: Invalid JSON response from Supabase"
    echo "Response: $results"
    exit 1
fi

echo "Found $(echo "$results" | jq length) renders to process"

# Initialize counters using temporary files
successful_renders_file=$(mktemp)
failed_renders_file=$(mktemp)
echo 0 > "$successful_renders_file"
echo 0 > "$failed_renders_file"

# Process each result
echo "$results" | jq -c '.[]' | while read -r object; do
  id=$(echo "$object" | jq -r '.id')
  uuid=$(echo "$object" | jq -r '.uuid')
  video=$(echo "$object" | jq -r '.video')
  parameters=$(echo "$object" | jq -r '.parameters')
  
  # For debugging: print video information
  echo "Found video to render: $uuid, Video: $video"
  
  # Check if video is empty or null
  if [[ -z "$video" ]]; then
    echo "Error: No video specified. Skipping this entry."
    continue
  fi
  
  # Check if video contains only alphanumeric characters, underscores, and hyphens
  if [[ ! $video =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "Error: Invalid video name: '$video'. Skipping this entry."
    continue
  fi
  
  # Validate parameters (example: check if it's valid JSON)
  if ! jq -e . >/dev/null 2>&1 <<< "$parameters"; then
    echo "Error: Invalid JSON in parameters for render with ID $id. Skipping this entry."
    continue
  fi
  
  # Add started_timestamp before rendering
  started_timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S")
  update_result=$(curl -s -X PATCH \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"started_timestamp\":\"$started_timestamp\"}" \
    "${PUBLIC_SUPABASE_URL}/rest/v1/${RENDER_TABLE_NAME}?id=eq.$id")
  
  if [[ $update_result == "[]" ]]; then
    echo "Successfully updated started_timestamp for render with ID $id"
  else
    echo "Error updating started_timestamp for render with ID $id"
  fi

  # Run the Remotion render command for each object
  echo "Running: npx remotion render $video --props=\"$parameters\" --output=\"out/$uuid.mp4\""
  if npx remotion render $video --props="$parameters" --output="out/$uuid.mp4"; then
    echo $(($(cat "$successful_renders_file") + 1)) > "$successful_renders_file"
    
    # Upload the rendered video to Supabase storage
    echo "Uploading video to Supabase storage..."
    upload_result=$(curl -X POST \
      -H "apikey: $SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
      --data-binary "@out/$uuid.mp4" \
      -H "Content-Type: video/mp4" \
      "${PUBLIC_SUPABASE_URL}/storage/v1/object/videos/$uuid.mp4")

    if echo "$upload_result" | grep -q "Key"; then
      echo "Successfully uploaded video to storage bucket"
      # Clean up local file after successful upload
      rm "out/$uuid.mp4"
    else
      echo "Error uploading video to storage bucket"
      echo "Upload response: $upload_result"
    fi
    
    # Update the render row with finished_timestamp
    finished_timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S")
    update_result=$(curl -s -i -X PATCH \
      -H "apikey: $SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"finished_timestamp\":\"$finished_timestamp\"}" \
      "${PUBLIC_SUPABASE_URL}/rest/v1/${RENDER_TABLE_NAME}?id=eq.$id")
    
    if echo "$update_result" | grep -q "204"; then
      echo "Successfully updated finished_timestamp for render with ID $id"
    else
      echo "Error updating finished_timestamp for render with ID $id"
      echo "Response: $update_result"
    fi
  else
    echo "Error: Remotion render failed for video $video with UUID $uuid. Skipping this entry."
    echo $(($(cat "$failed_renders_file") + 1)) > "$failed_renders_file"
  fi
done

# Read the final counts
successful_renders=$(cat "$successful_renders_file")
failed_renders=$(cat "$failed_renders_file")

# Clean up temporary files
rm "$successful_renders_file" "$failed_renders_file"

# Update the final message
echo "All renders completed. Successful renders: $successful_renders, Failed renders: $failed_renders"