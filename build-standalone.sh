#!/bin/bash

# Exit on error
set -e

echo "📦 Building the Command Center Standalone Demo"
echo "=============================================="

# 1. Build the Monorepo (Client & Server)
echo "1️⃣  Building the client and server..."
pnpm build

# 2. Prepare the public directory in the server build
echo "2️⃣  Preparing static assets..."
rm -rf apps/server/dist/public
mkdir -p apps/server/dist/public
cp -r apps/client/dist/* apps/server/dist/public/

# 3. Create the executable using pkg
echo "3️⃣  Packaging executable for macOS..."
mkdir -p demo-build

# Bundle the server so pkg doesn't choke on ESM or dynamic imports
echo "   -> Bundling server with esbuild..."
npx esbuild apps/server/src/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=cjs \
  --outfile=apps/server/dist/bundle.cjs \
  --minify \
  --sourcemap

# Add a tiny package.json just for pkg so it knows what to do
cat > apps/server/dist/pkg-package.json << 'EOF'
{
  "name": "command-center",
  "main": "bundle.cjs",
  "bin": "bundle.cjs",
  "pkg": {
    "scripts": "bundle.cjs",
    "assets": [
      "public/**/*"
    ]
  }
}
EOF

echo "   -> Running pkg..."
cd apps/server/dist
npx pkg bundle.cjs \
  --target node18-macos-arm64,node18-macos-x64,node18-win-x64,node18-linux-x64,node18-linux-arm64 \
  --config pkg-package.json \
  --out-path ../../../demo-build/bin/
cd ../../../

# No renaming needed as pkg uses the name from pkg-package.json
# But we ensure they are readable:
chmod +x demo-build/bin/* || true

# 4. Create the wrapper scripts
echo "4️⃣  Creating runner scripts..."

# macOS Launcher
cat > demo-build/Run\ Demo.command << 'EOF'
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
MAC_ARCH=$(uname -m)
echo "Starting Command Center Local Demo..."
if [ "$MAC_ARCH" = "arm64" ]; then
    EXECUTABLE="$DIR/bin/command-center-macos-arm64"
else
    EXECUTABLE="$DIR/bin/command-center-macos-x64"
fi
if [ ! -f "$EXECUTABLE" ]; then
    echo "Error: Could not find executable for architecture $MAC_ARCH"
    read -n 1 -s
    exit 1
fi
echo "The server is running! Close this window to stop it."

# Clear quarantine attribute and ensure executability to avoid "Killed: 9" on macOS
xattr -d com.apple.quarantine "$EXECUTABLE" 2>/dev/null || true
chmod +x "$EXECUTABLE"

"$EXECUTABLE"
echo "Server stopped. Press any key to exit..."
read -n 1 -s
EOF
chmod +x demo-build/Run\ Demo.command

# Windows Launcher
cat > demo-build/Run\ Demo.bat << 'EOF'
@echo off
set DIR=%~dp0
echo Starting Command Center Local Demo...
if not exist "%DIR%bin\command-center-win-x64.exe" (
    echo Error: Could not find bin\command-center-win-x64.exe
    pause
    exit /b 1
)
echo The server is running! Close this window to stop it.
"%DIR%bin\command-center-win-x64.exe"
echo.
echo Server stopped.
pause
EOF

# Linux Launcher
cat > demo-build/Run\ Demo.sh << 'EOF'
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ARCH=$(uname -m)
echo "Starting Command Center Local Demo..."
if [ "$ARCH" = "x86_64" ]; then
    EXECUTABLE="$DIR/bin/command-center-linux-x64"
else
    EXECUTABLE="$DIR/bin/command-center-linux-arm64"
fi
if [ ! -f "$EXECUTABLE" ]; then
    echo "Error: Could not find executable for architecture $ARCH"
    exit 1
fi
chmod +x "$EXECUTABLE"
echo "The server is running! Close this window to stop it."
"$EXECUTABLE"
echo "Server stopped."
EOF
chmod +x demo-build/Run\ Demo.sh

# 5. Zip it up
echo "5️⃣  Creating ZIP file..."
rm -f CommandCenterDemo.zip
cd demo-build
zip -r ../CommandCenterDemo.zip ./*
cd ..

echo "✅ Done! You can now send CommandCenterDemo.zip to your manager."
echo "The ZIP contains launchers for macOS, Windows, and Linux."
