#!/bin/sh

# Capacitor signature is now stripped via a Run Script build phase in the Xcode project
# (after framework embedding, before code signing) - do not touch the xcframework here
echo "=== PRE_XCODEBUILD: nothing to do ==="
exit 0
