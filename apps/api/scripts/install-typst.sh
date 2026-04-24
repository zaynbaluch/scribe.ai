#!/bin/bash
# Download Typst for Linux x86_64 (Render/Linux compatibility)
TYPST_VERSION="0.11.0"
URL="https://github.com/typst/typst/releases/download/v${TYPST_VERSION}/typst-x86_64-unknown-linux-musl.tar.xz"

echo "Downloading Typst v${TYPST_VERSION}..."
curl -L $URL -o typst.tar.xz
tar -xJf typst.tar.xz
mv typst-x86_64-unknown-linux-musl/typst ./typst-bin
rm -rf typst.tar.xz typst-x86_64-unknown-linux-musl
chmod +x ./typst-bin
echo "Typst installed to $(pwd)/typst-bin"
