#!/bin/sh

echo "=== PRE_XCODEBUILD: Strip Capacitor original signature ==="
echo "HOME: $HOME"

# Search all likely SPM cache locations for Capacitor.xcframework
# Stripping the 3rd-party signature forces Xcode to re-sign with Apple Distribution during export
for SEARCH in /Volumes/workspace "$HOME/Library/Developer/Xcode/DerivedData" "$HOME"; do
  [ -d "$SEARCH" ] || continue
  find "$SEARCH" -name "Capacitor.xcframework" -type d 2>/dev/null | while IFS= read -r xf; do
    echo "Found: $xf"
    find "$xf" -name "Capacitor" -type f 2>/dev/null | while IFS= read -r bin; do
      echo "Stripping: $bin"
      codesign --remove-signature "$bin" 2>&1 || true
      echo "  Stripped OK"
    done
  done
done

echo "=== DONE ==="
