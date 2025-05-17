#!/bin/bash

# Get the environment variables
source .env

echo "Installing Python requirements..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "Error: Failed to install Python requirements"
    exit 1
fi

echo "Running render_action.py..."
python3 render_action.py

exit $?