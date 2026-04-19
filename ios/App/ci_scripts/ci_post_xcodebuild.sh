#!/bin/sh

[ -z "$CI_ARCHIVE_PATH" ] && exit 0

echo "=== POST_XCODEBUILD ==="
echo "Archive: $CI_ARCHIVE_PATH"
echo "--- CI Vars ---"
env | grep "^CI_" | sort
echo "--- Keychains ---"
security list-keychains 2>/dev/null
echo "--- Code Signing Identities ---"
security find-identity -v -p codesigning 2>/dev/null
echo "--- IPA Files ---"
find /Volumes/workspace -maxdepth 8 -name "*.ipa" 2>/dev/null
echo "---"

ARCHIVE_APP=$(find "$CI_ARCHIVE_PATH/Products/Applications" -maxdepth 1 -name "*.app" -type d 2>/dev/null | head -1)
echo "Archive app: ${ARCHIVE_APP:-NOT FOUND}"
[ -z "$ARCHIVE_APP" ] && exit 0

# Find distribution identity across all keychains
IDENTITY=$(security find-identity -v -p codesigning 2>/dev/null | grep -E '"(Apple|iPhone) Distribution' | head -1 | sed -E 's/.*"([^"]+)".*/\1/')
if [ -z "$IDENTITY" ]; then
  for KC in $(security list-keychains 2>/dev/null | tr -d '"' | tr -d ' '); do
    [ -f "$KC" ] || continue
    IDENTITY=$(security find-identity -v -p codesigning "$KC" 2>/dev/null | grep -E '"(Apple|iPhone) Distribution' | head -1 | sed -E 's/.*"([^"]+)".*/\1/')
    [ -n "$IDENTITY" ] && echo "Identity found in: $KC" && break
  done
fi
echo "Identity: ${IDENTITY:-NOT FOUND}"

sign_app_frameworks() {
  local APP_DIR="$1"
  local CERT="$2"
  [ -d "$APP_DIR/Frameworks" ] || return 0
  find "$APP_DIR/Frameworks" -name "*.framework" -type d | while IFS= read -r fw; do
    FW_NAME=$(basename "$fw" .framework)
    BIN="$fw/$FW_NAME"
    [ -f "$BIN" ] && codesign --force --sign "$CERT" --timestamp "$BIN" 2>&1 || true
    codesign --force --sign "$CERT" --timestamp --preserve-metadata=identifier,entitlements "$fw" 2>&1 || true
    echo "  Signed: $FW_NAME"
  done
}

if [ -n "$IDENTITY" ]; then
  echo "--- Signing archive frameworks ---"
  sign_app_frameworks "$ARCHIVE_APP" "$IDENTITY"

  echo "--- Signing exported IPAs ---"
  for IPA in $(find /Volumes/workspace -maxdepth 8 -name "*.ipa" 2>/dev/null); do
    echo "Processing IPA: $IPA"
    TMP=$(mktemp -d)
    unzip -q "$IPA" -d "$TMP" 2>/dev/null && {
      IPA_APP=$(find "$TMP/Payload" -maxdepth 1 -name "*.app" -type d 2>/dev/null | head -1)
      if [ -n "$IPA_APP" ]; then
        sign_app_frameworks "$IPA_APP" "$IDENTITY"
        codesign --force --sign "$IDENTITY" --timestamp --preserve-metadata=identifier,entitlements "$IPA_APP" 2>&1 || true
        (cd "$TMP" && zip -qr "$IPA" Payload) && echo "  IPA updated: $IPA" || echo "  IPA repack failed"
      fi
    }
    rm -rf "$TMP"
  done
else
  echo "--- No identity found: stripping sigs from archive to force Xcode re-sign ---"
  find "$ARCHIVE_APP/Frameworks" -name "*.framework" -type d | while IFS= read -r fw; do
    FW_NAME=$(basename "$fw" .framework)
    BIN="$fw/$FW_NAME"
    [ -f "$BIN" ] && codesign --remove-signature "$BIN" 2>&1 || true
    codesign --remove-signature "$fw" 2>&1 || true
    echo "  Stripped: $FW_NAME"
  done
fi

echo "=== DONE ==="
