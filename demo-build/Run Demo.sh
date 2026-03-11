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
