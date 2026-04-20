#!/bin/sh
[ -z "$CI_ARCHIVE_PATH" ] && exit 0

echo "=== POST_XCODEBUILD DIAGNOSTIC ==="
ARCHIVE_APP=$(find "$CI_ARCHIVE_PATH/Products/Applications" -maxdepth 1 -name "*.app" -type d 2>/dev/null | head -1)
[ -z "$ARCHIVE_APP" ] && echo "No app bundle found" && exit 0

IPA=$(find /Volumes/workspace/appstoreexport -name "*.ipa" 2>/dev/null | head -1)
if [ -n "$IPA" ]; then
    echo "--- Full codesign of Capacitor in App Store IPA ---"
    TMP=$(mktemp -d)
    unzip -q "$IPA" -d "$TMP" 2>/dev/null
    IPA_CAP=$(find "$TMP" -path "*/Capacitor.framework/Capacitor" 2>/dev/null | head -1)
    if [ -n "$IPA_CAP" ]; then
        codesign -dv --verbose=4 "$IPA_CAP" 2>&1
        echo "--- Designated Requirement (should reference JTG5N2U9J7, NOT ionic-team) ---"
        codesign -d --requirements - "$IPA_CAP" 2>&1
        echo "--- Verify (must show: valid on disk + satisfies its designated Requirement) ---"
        codesign --verify --verbose "$IPA_CAP" 2>&1
        VERIFY_EXIT=$?
        echo "--- Verify exit code: $VERIFY_EXIT (0=pass, non-zero=fail) ---"
    fi
    echo "--- Full codesign of ALL frameworks in IPA ---"
    find "$TMP" -name "*.framework" -type d 2>/dev/null | while read fw; do
        BIN="$fw/$(basename $fw .framework)"
        [ -f "$BIN" ] && echo "$(basename $fw): $(codesign -dv $BIN 2>&1 | grep -E 'Authority=|Signature=|TeamIdentifier=' | tr '\n' ' ')"
    done
    rm -rf "$TMP"
else
    echo "No appstoreexport IPA found"
    find /Volumes/workspace -name "*.ipa" 2>/dev/null
fi
echo "=== DONE ==="
