#!/bin/bash
# Generate icon.icns from a 1024x1024 PNG
# Usage: ./scripts/generate-icon.sh path/to/icon.png

INPUT="${1:-build/icon.png}"
ICONSET="build/icon.iconset"

if [ ! -f "$INPUT" ]; then
  echo "⚠️  File $INPUT tidak ditemukan."
  echo "   Letakkan file icon 1024x1024 PNG di build/icon.png"
  echo "   Lalu jalankan: ./scripts/generate-icon.sh"
  exit 1
fi

mkdir -p "$ICONSET"

# Generate all required sizes
sips -z 16 16     "$INPUT" --out "$ICONSET/icon_16x16.png"
sips -z 32 32     "$INPUT" --out "$ICONSET/icon_16x16@2x.png"
sips -z 32 32     "$INPUT" --out "$ICONSET/icon_32x32.png"
sips -z 64 64     "$INPUT" --out "$ICONSET/icon_32x32@2x.png"
sips -z 128 128   "$INPUT" --out "$ICONSET/icon_128x128.png"
sips -z 256 256   "$INPUT" --out "$ICONSET/icon_128x128@2x.png"
sips -z 256 256   "$INPUT" --out "$ICONSET/icon_256x256.png"
sips -z 512 512   "$INPUT" --out "$ICONSET/icon_256x256@2x.png"
sips -z 512 512   "$INPUT" --out "$ICONSET/icon_512x512.png"
sips -z 1024 1024 "$INPUT" --out "$ICONSET/icon_512x512@2x.png"

# Convert to icns
iconutil -c icns "$ICONSET" -o build/icon.icns

# Cleanup
rm -rf "$ICONSET"

echo "✅ Icon berhasil dibuat: build/icon.icns"
