#!/bin/sh

echo "=== PRE_XCODEBUILD: Strip Capacitor signature ==="

# Find Capacitor.xcframework in SPM package cache and strip its signature
# so Xcode archive signs it ad-hoc, and export re-signs with Apple Distribution
find /Volumes/workspace -name "Capacitor.xcframework" -type d 2>/dev/null | while IFS= read -r xf; do
  echo "Found XCFramework: $xf"
  find "$xf" -name "Capacitor" -type f 2>/dev/null | while IFS= read -r bin; do
    echo "Stripping: $bin"
    codesign --remove-signature "$bin" 2>&1 || true
    echo "  OK"
  done
done

echo "=== DONE ==="
