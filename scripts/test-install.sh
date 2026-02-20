#!/bin/bash

# ==============================================================================
# AI Context OS - Local Installation Test Script
# Description: Verifies the installer logic by deploying to a temp sandbox.
# ==============================================================================

set -e

# Configuration
PROJ_ROOT=$(pwd)
TEST_SANDBOX="/tmp/ai-context-os-sandbox"

echo "=========================================="
echo "  AI Context OS - Local Test Runner"
echo "=========================================="

# 1. Preparation
echo "1. Cleaning up previous sandbox: $TEST_SANDBOX"
rm -rf "$TEST_SANDBOX"
mkdir -p "$TEST_SANDBOX"

# 2. Execution
echo "2. Running installer from $PROJ_ROOT to $TEST_SANDBOX"
node "$PROJ_ROOT/bin/install.js" "$TEST_SANDBOX"

# 3. Verification
echo -e "\n3. Verifying Deployment..."

CHECK_FILES=(
    ".ai-context-os/PROJECT_OS.md"
    ".ai-context-os/skills/README.md"
    ".cursorrules"
    "CLAUDE.md"
    "GEMINI.md"
)

SUCCESS=true

for file in "${CHECK_FILES[@]}"; do
    if [ -f "$TEST_SANDBOX/$file" ]; then
        echo "  [OK] Found: $file"
    else
        echo "  [FAIL] Missing: $file"
        SUCCESS=false
    fi
done

echo "------------------------------------------"
if [ "$SUCCESS" = true ]; then
    echo -e "\033[32m✔ Local Installation Test PASSED!\033[0m"
    echo "You can inspect the sandbox at: $TEST_SANDBOX"
else
    echo -e "\033[31m✘ Local Installation Test FAILED.\033[0m"
    exit 1
fi
