#!/bin/bash

# Slither analysis runner script
# This script runs Slither with proper error handling and output formatting

set -e

ANALYSIS_DIR=${1:-"/analysis"}
OUTPUT_FORMAT=${2:-"json"}
TIMEOUT=${3:-"30"}

echo "Starting Slither analysis..."
echo "Analysis directory: $ANALYSIS_DIR"
echo "Output format: $OUTPUT_FORMAT"
echo "Timeout: ${TIMEOUT}s"

# Check if analysis directory exists
if [ ! -d "$ANALYSIS_DIR" ]; then
    echo "Error: Analysis directory does not exist: $ANALYSIS_DIR"
    exit 1
fi

# Find Solidity files
SOLIDITY_FILES=$(find "$ANALYSIS_DIR" -name "*.sol" 2>/dev/null || true)

if [ -z "$SOLIDITY_FILES" ]; then
    echo "No Solidity files found in $ANALYSIS_DIR"
    echo '{"error": "No Solidity files found", "results": {"detectors": []}}' 
    exit 0
fi

echo "Found Solidity files:"
echo "$SOLIDITY_FILES"

# Run Slither with timeout
timeout "$TIMEOUT" slither "$ANALYSIS_DIR" \
    --json - \
    --exclude-dependencies \
    --disable-color \
    --checklist \
    || {
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 124 ]; then
            echo '{"error": "Analysis timeout", "results": {"detectors": []}}'
        else
            echo '{"error": "Analysis failed", "results": {"detectors": []}}'
        fi
        exit 0
    }

echo "Slither analysis completed successfully"