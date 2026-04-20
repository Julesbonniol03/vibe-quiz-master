#!/bin/sh
[ -z "$CI_ARCHIVE_PATH" ] && exit 0

echo "=== POST_XCODEBUILD DIAGNOSTIC ==="
echo "Archive: $CI_ARCHIVE_PATH"

ARCHIVE_APP=$(find "$CI_ARCHIVE_PATH/Products/Applications" -maxdepth 1 -name "*.app" -type d 2>/dev/null | head -1)
echo "App bundle: ${ARCHIVE_APP:-NOT FOUND}"
[ -z "$ARCHIVE_APP" ] && exit 0

# Check main executable signature (what cert is Xcode using?)
APP_NAME=$(basename "$ARCHIVE_APP" .app)
MAIN_EXEC="$ARCHIVE_APP/$APP_NAME"
echo "--- Main executable ($APP_NAME) ---"
codesign -dv "$MAIN_EXEC" 2>&1 | grep -E 'Authority|TeamIdentifier|Signature=' || echo "(no match)"

# Check Capacitor in archive
CAPACITOR="$ARCHIVE_APP/Frameworks/Capacitor.framework/Capacitor"
echo "--- Capacitor in ARCHIVE ---"
if [ -f "$CAPACITOR" ]; then
    codesign -dv "$CAPACITOR" 2>&1 | grep -E 'Authority|TeamIdentifier|Signature='
else
    echo "NOT FOUND"
fi

# Search for IPAs
echo "--- IPA files found ---"
find /Volumes/workspace -name "*.ipa" 2>/dev/null | head -10

# Check Capacitor inside the App Store IPA
IPA=$(find /Volumes/workspace -name "*.ipa" 2>/dev/null | grep -i "app.store\|appstore\|App Store" | head -1)
[ -z "$IPA" ] && IPA=$(find /Volumes/workspace -name "*.ipa" 2>/dev/null | head -1)

if [ -n "$IPA" ]; then
    echo "--- Capacitor in IPA: $(basename $IPA) ---"
    TMP=$(mktemp -d)
    unzip -q "$IPA" -d "$TMP" 2>/dev/null
    IPA_CAP=$(find "$TMP" -path "*/Capacitor.framework/Capacitor" 2>/dev/null | head -1)
    if [ -n "$IPA_CAP" ]; then
        codesign -dv "$IPA_CAP" 2>&1 | grep -E 'Authority|TeamIdentifier|Signature='
    else
        echo "Capacitor not found in IPA"
    fi
    rm -rf "$TMP"
else
    echo "No IPA found yet (script runs before exports)"
fi

echo "=== DONE ==="
