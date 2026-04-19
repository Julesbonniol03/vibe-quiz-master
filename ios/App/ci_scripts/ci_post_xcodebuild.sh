#!/bin/sh
[ -z "$CI_ARCHIVE_PATH" ] && exit 0

echo "=== POST_XCODEBUILD: Checking Capacitor Signature ==="
echo "Archive: $CI_ARCHIVE_PATH"

ARCHIVE_APP=$(find "$CI_ARCHIVE_PATH/Products/Applications" -maxdepth 1 -name "*.app" -type d 2>/dev/null | head -1)
echo "App bundle: ${ARCHIVE_APP:-NOT FOUND}"
[ -z "$ARCHIVE_APP" ] && exit 0

echo "Frameworks in archive:"
ls -la "$ARCHIVE_APP/Frameworks/" 2>/dev/null || echo "  (no Frameworks dir)"

CAPACITOR="$ARCHIVE_APP/Frameworks/Capacitor.framework/Capacitor"
if [ -f "$CAPACITOR" ]; then
    echo "Capacitor signature:"
    codesign -dv "$CAPACITOR" 2>&1
else
    echo "Capacitor NOT FOUND at expected path, searching..."
    find "$ARCHIVE_APP" -name "Capacitor" -type f 2>/dev/null | head -5
fi

echo "=== DONE ==="
