#!/bin/bash
# Download Typst for Linux x86_64 (Render/Linux compatibility)
TYPST_VERSION="0.11.0"
URL="https://github.com/typst/typst/releases/download/v${TYPST_VERSION}/typst-x86_64-unknown-linux-musl.tar.xz"

# Determine the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# The target directory is the parent of the scripts folder (apps/api)
TARGET_DIR="$(dirname "$SCRIPT_DIR")"

echo "Installing Typst to $TARGET_DIR..."

echo "Downloading Typst v${TYPST_VERSION}..."
curl -L $URL -o typst.tar.xz
tar -xJf typst.tar.xz
mv typst-x86_64-unknown-linux-musl/typst "$TARGET_DIR/typst-bin"
rm -rf typst.tar.xz typst-x86_64-unknown-linux-musl
chmod +x "$TARGET_DIR/typst-bin"

if [ -f "$TARGET_DIR/typst-bin" ]; then
    echo "Successfully installed Typst to $TARGET_DIR/typst-bin"
else
    echo "ERROR: Typst installation failed!"
    exit 1
fi
