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
"$EXECUTABLE"
echo "Server stopped. Press any key to exit..."
read -n 1 -s
