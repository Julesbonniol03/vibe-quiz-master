#!/bin/sh
[ -z "$CI_ARCHIVE_PATH" ] && exit 0

echo "=== POST_XCODEBUILD: fix Ionic DR in App Store IPA ==="

IPA=$(find /Volumes/workspace/appstoreexport -name "*.ipa" 2>/dev/null | head -1)
if [ -z "$IPA" ]; then
    echo "No appstoreexport IPA found"
    find /Volumes/workspace -name "*.ipa" 2>/dev/null
    echo "=== DONE ===" && exit 0
fi

echo "IPA: $IPA"
TMP=$(mktemp -d)
unzip -q "$IPA" -d "$TMP"
APP=$(find "$TMP/Payload" -maxdepth 1 -name "*.app" -type d 2>/dev/null | head -1)

if [ -z "$APP" ]; then
    echo "No .app in IPA" && rm -rf "$TMP" && echo "=== DONE ===" && exit 0
fi

echo "App: $(basename $APP)"

# Re-sign every framework, clearing third-party designated requirements.
# Ionic's capacitor-swift-pm has a DR specifying Ionic's cert; after we
# re-sign with Apple Distribution the DR no longer matches -> codesign
# --verify fails -> Apple rejects. Clearing DR (not listed in
# --preserve-metadata) lets codesign generate a fresh one for our team.
echo "--- Re-signing frameworks ---"
for fw in "$APP"/Frameworks/*.framework; do
    [ -d "$fw" ] || continue
    BIN="$fw/$(basename "$fw" .framework)"
    [ -f "$BIN" ] || continue
    echo "  $(basename $fw)"
    /usr/bin/codesign --force --sign "Apple Distribution" \
        --preserve-metadata=identifier,entitlements,flags \
        "$fw" 2>&1
done

# Re-sign the app bundle so sealed-resources digest reflects the new framework sigs
echo "--- Re-signing app bundle ---"
/usr/bin/codesign --force --sign "Apple Distribution" \
    --preserve-metadata=identifier,entitlements,flags \
    "$APP" 2>&1

# Diagnostic
echo "--- Capacitor codesign after fix ---"
IPA_CAP=$(find "$APP/Frameworks/Capacitor.framework" -name "Capacitor" -type f 2>/dev/null)
if [ -n "$IPA_CAP" ]; then
    codesign -dv "$IPA_CAP" 2>&1 | grep -E 'Authority=|TeamIdentifier='
    echo "Designated requirement:"
    codesign -d --requirements - "$IPA_CAP" 2>&1
    echo "Verify:"
    codesign --verify --verbose "$IPA_CAP" 2>&1
    echo "Verify exit: $?"
fi

# Replace IPA in-place so the upload step uses the fixed binary
echo "--- Rebuilding IPA ---"
rm -f "$IPA"
(cd "$TMP" && zip -qr "$IPA" Payload/)
echo "IPA rebuilt at: $IPA"

rm -rf "$TMP"
echo "=== DONE ==="
