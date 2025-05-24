#!/usr/bin/env python3

import os
import json
import subprocess
import requests
from datetime import datetime
import boto3
from botocore.client import Config
from dotenv import load_dotenv
import argparse
import time

def load_composition_costs():
    """Load composition render costs from the TypeScript config file"""
    try:
        # Read the compositions config file
        with open('src/compositions.config.ts', 'r') as f:
            content = f.read()
        
        # Extract renderCost values using regex
        import re
        costs = {}
        
        # Find all composition definitions
        composition_pattern = r'(\w+):\s*{[^}]*renderCost:\s*(\d+)[^}]*}'
        matches = re.findall(composition_pattern, content, re.DOTALL)
        
        for comp_name, cost in matches:
            costs[comp_name] = int(cost)
        
        print(f"Loaded composition costs: {costs}")
        return costs
    except Exception as e:
        print(f"Error loading composition costs: {e}")
        # Return default costs if file cannot be read
        return {}

def get_user_tokens(user_id):
    """Get the current token count for a user"""
    try:
        response = requests.get(
            f"{os.environ['PUBLIC_SUPABASE_URL']}/rest/v1/accounts?user_id=eq.{user_id}&select=tokens",
            headers={
                "apikey": os.environ["SERVICE_ROLE_KEY"],
                "Authorization": f"Bearer {os.environ['SERVICE_ROLE_KEY']}"
            }
        )
        response.raise_for_status()
        results = response.json()
        
        if results and len(results) > 0:
            return results[0].get('tokens', 0)
        else:
            print(f"No account found for user_id: {user_id}")
            return 0
    except Exception as e:
        print(f"Error getting user tokens: {e}")
        return 0

def deduct_user_tokens(user_id, cost):
    """Deduct tokens from user's account"""
    try:
        # First get current tokens
        current_tokens = get_user_tokens(user_id)
        new_token_count = current_tokens - cost
        
        response = requests.patch(
            f"{os.environ['PUBLIC_SUPABASE_URL']}/rest/v1/accounts?user_id=eq.{user_id}",
            headers={
                "apikey": os.environ["SERVICE_ROLE_KEY"],
                "Authorization": f"Bearer {os.environ['SERVICE_ROLE_KEY']}",
                "Content-Type": "application/json"
            },
            json={"tokens": new_token_count}
        )
        
        if response.status_code == 204:
            print(f"Successfully deducted {cost} tokens from user {user_id}. New balance: {new_token_count}")
            return True
        else:
            print(f"Error deducting tokens: {response.text}")
            return False
    except Exception as e:
        print(f"Error deducting user tokens: {e}")
        return False

def update_render_status(render_id, status, error_message=None):
    """Update render status to error or other states"""
    try:
        update_data = {"status": status}
        if error_message:
            update_data["error_message"] = error_message
            
        response = requests.patch(
            f"{os.environ['PUBLIC_SUPABASE_URL']}/rest/v1/renders?id=eq.{render_id}",
            headers={
                "apikey": os.environ["SERVICE_ROLE_KEY"],
                "Authorization": f"Bearer {os.environ['SERVICE_ROLE_KEY']}",
                "Content-Type": "application/json"
            },
            json=update_data
        )
        
        if response.status_code == 204:
            print(f"Successfully updated render {render_id} status to {status}")
            return True
        else:
            print(f"Error updating render status: {response.text}")
            return False
    except Exception as e:
        print(f"Error updating render status: {e}")
        return False

def main(continuous):
    # Load environment variables from .env file
    load_dotenv()
    
    # Check and install Remotion dependencies
    print("Checking and installing Remotion dependencies...")
    try:
        subprocess.run(
            ["npm", "install", "@remotion/compositor-linux-x64-gnu", "@remotion/compositor-linux-x64-musl"],
            check=True
        )
    except subprocess.CalledProcessError:
        print("Error: Failed to install Remotion dependencies")
        exit(1)
    
    # Check required environment variables
    required_env_vars = [
        "SERVICE_ROLE_KEY",
        "PUBLIC_SUPABASE_URL",
        "DIGITAL_OCEAN_STORAGE_KEY",
        "DIGITAL_OCEAN_STORAGE_KEY_ID",
        "DIGITAL_OCEAN_STORAGE_URL"
    ]
    
    for var in required_env_vars:
        if not os.environ.get(var):
            print(f"Error: {var} is not set")
            exit(1)
    
    # Load composition costs
    composition_costs = load_composition_costs()
    
    # Your table names
    RENDER_TABLE_NAME = "renders"
    
    while True:
        # Query parameters (optional) - need to include user_id
        RENDER_QUERY_PARAMS = "select=*,user_id&started_timestamp=is.null&limit=5"
        
        # Make the API request to get pending renders
        print("Querying Supabase for pending renders...")
        try:
            response = requests.get(
                f"{os.environ['PUBLIC_SUPABASE_URL']}/rest/v1/{RENDER_TABLE_NAME}?{RENDER_QUERY_PARAMS}",
                headers={
                    "apikey": os.environ["SERVICE_ROLE_KEY"],
                    "Authorization": f"Bearer {os.environ['SERVICE_ROLE_KEY']}"
                }
            )
            response.raise_for_status()
            results = response.json()
        except requests.RequestException as e:
            print(f"Error: Failed to connect to Supabase API: {e}")
            exit(1)
        except json.JSONDecodeError:
            print("Error: Invalid JSON response from Supabase")
            print(f"Response: {response.text}")
            exit(1)
        
        # Check if results is empty
        if not results:
            print("No pending renders found.")
            if not continuous:
                print("Exiting successfully.")
                exit(0)
            else:
                print("Waiting 60 seconds before checking again...")
                time.sleep(60)
                continue
        
        print(f"Found {len(results)} renders to process")
        
        # Initialize counters
        successful_renders = 0
        failed_renders = 0
        
        # Process each result
        for render in results:
            render_id = render['id']
            uuid = render['uuid']
            video = render['video']
            parameters = render['parameters']
            user_id = render['user_id']  # Get user_id for token deduction
            
            # For debugging: print video information
            print(f"Found video to render: {uuid}, Video: {video}, User: {user_id}")
            
            # Check if video is empty or null
            if not video:
                print("Error: No video specified. Skipping this entry.")
                continue
            
            # Check if video contains only alphanumeric characters, underscores, and hyphens
            import re
            if not re.match(r'^[a-zA-Z0-9_-]+$', video):
                print(f"Error: Invalid video name: '{video}'. Skipping this entry.")
                continue
            
            # Get render cost for this composition
            render_cost = composition_costs.get(video, 1) # Default to 1 if not found
            print(f"Render cost for {video}: {render_cost} tokens")
            
            # Check if user has enough tokens
            user_tokens = get_user_tokens(user_id)
            print(f"User {user_id} has {user_tokens} tokens")
            
            if user_tokens < render_cost:
                print(f"User {user_id} does not have enough tokens ({user_tokens} < {render_cost})")
                update_render_status(render_id, "error", "Not enough tokens.")
                failed_renders += 1
                continue
            
            # Validate parameters 
            try:
                # Ensure it's valid JSON if it's a string
                if isinstance(parameters, str):
                    parameters = json.loads(parameters)
                # Convert back to a JSON string for the command
                parameters_str = json.dumps(parameters)
            except json.JSONDecodeError:
                print(f"Error: Invalid JSON in parameters for render with ID {render_id}. Skipping this entry.")
                continue
            
            # Add started_timestamp before rendering
            started_timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S")
            try:
                update_response = requests.patch(
                    f"{os.environ['PUBLIC_SUPABASE_URL']}/rest/v1/{RENDER_TABLE_NAME}?id=eq.{render_id}",
                    headers={
                        "apikey": os.environ["SERVICE_ROLE_KEY"],
                        "Authorization": f"Bearer {os.environ['SERVICE_ROLE_KEY']}",
                        "Content-Type": "application/json"
                    },
                    json={"started_timestamp": started_timestamp}
                )
                
                if update_response.status_code == 204:
                    print(f"Successfully updated started_timestamp for render with ID {render_id}")
                else:
                    print(f"Error updating started_timestamp for render with ID {render_id}")
                    print(f"Response: {update_response.text}")
            except requests.RequestException as e:
                print(f"Error updating started_timestamp: {e}")
            
            # Run the Remotion render command
            output_path = f"out/{uuid}.mp4"
            os.makedirs("out", exist_ok=True)
            
            render_command = ["npx", "remotion", "render", video, f"--props={parameters_str}", f"--output={output_path}"]
            print(f"Running: {' '.join(render_command)}")
            
            try:
                subprocess.run(render_command, check=True)
                
                # Check if the file exists and has size greater than 0
                if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                    print(f"Error: Rendered file {output_path} does not exist or is empty.")
                    failed_renders += 1
                    continue
                
                # Upload the rendered video to Digital Ocean Spaces
                print("Uploading video to Digital Ocean Spaces...")
                
                # Parse the Digital Ocean storage URL to get the bucket name and endpoint
                from urllib.parse import urlparse
                parsed_url = urlparse(os.environ["DIGITAL_OCEAN_STORAGE_URL"])
                endpoint_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
                
                # Extract bucket name from the hostname (first part of the domain)
                bucket_name = parsed_url.netloc.split('.')[0]
                
                if not bucket_name:
                    print("Error: Could not extract bucket name from DIGITAL_OCEAN_STORAGE_URL")
                    print(f"DIGITAL_OCEAN_STORAGE_URL: {os.environ['DIGITAL_OCEAN_STORAGE_URL']}")
                    failed_renders += 1
                    continue
                    
                print(f"Using bucket: {bucket_name}")
                
                # Configure S3 client for Digital Ocean Spaces
                s3_client = boto3.client(
                    's3',
                    endpoint_url=endpoint_url,
                    aws_access_key_id=os.environ["DIGITAL_OCEAN_STORAGE_KEY_ID"],
                    aws_secret_access_key=os.environ["DIGITAL_OCEAN_STORAGE_KEY"],
                    config=Config(signature_version='s3v4')
                )
                
                # Upload the file
                try:
                    with open(output_path, 'rb') as data:
                        s3_client.upload_fileobj(
                            data,
                            bucket_name,
                            f"videos/{uuid}.mp4",
                            ExtraArgs={'ACL': 'public-read', 'ContentType': 'video/mp4'}
                        )
                    print("Successfully uploaded video to Digital Ocean Spaces")
                    
                    # Clean up local file after successful upload
                    os.remove(output_path)
                    
                    # Deduct tokens from user account after successful rendering
                    if deduct_user_tokens(user_id, render_cost):
                        print(f"Successfully deducted {render_cost} tokens from user {user_id}")
                    else:
                        print(f"Warning: Failed to deduct tokens from user {user_id}")
                    
                    # Update the render row with finished_timestamp
                    finished_timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S")
                    update_response = requests.patch(
                        f"{os.environ['PUBLIC_SUPABASE_URL']}/rest/v1/{RENDER_TABLE_NAME}?id=eq.{render_id}",
                        headers={
                            "apikey": os.environ["SERVICE_ROLE_KEY"],
                            "Authorization": f"Bearer {os.environ['SERVICE_ROLE_KEY']}",
                            "Content-Type": "application/json"
                        },
                        json={"finished_timestamp": finished_timestamp}
                    )
                    
                    if update_response.status_code == 204:
                        print(f"Successfully updated finished_timestamp for render with ID {render_id}")
                        successful_renders += 1
                    else:
                        print(f"Error updating finished_timestamp for render with ID {render_id}")
                        print(f"Response: {update_response.text}")
                        failed_renders += 1
                        
                except Exception as e:
                    print(f"Error uploading video to Digital Ocean Spaces: {e}")
                    failed_renders += 1
                    
                    # If we still have the local file (upload failed), try to clean it up
                    if os.path.exists(output_path):
                        try:
                            os.remove(output_path)
                        except:
                            print(f"Warning: Could not remove temporary file {output_path}")
                
            except subprocess.CalledProcessError:
                print(f"Error: Remotion render failed for video {video} with UUID {uuid}. Skipping this entry.")
                failed_renders += 1
        
        # Update the final message
        print(f"Batch completed. Successful renders: {successful_renders}, Failed renders: {failed_renders}")
        
        # If not in continuous mode, exit after one run
        if not continuous:
            break
        
        # Wait for a while before the next check (e.g., 10 seconds)
        print("Waiting for the next cycle...")
        time.sleep(10)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Render videos and manage tokens.")
    parser.add_argument(
        "-r", "--run-continuous",
        action="store_true",
        help="Run in continuous mode, checking for new renders every few seconds."
    )
    args = parser.parse_args()
    
    # Call the main function with the continuous flag
    main(args.run_continuous)