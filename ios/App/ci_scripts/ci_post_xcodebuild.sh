#!/bin/sh
set -e

if [ -z "$CI_ARCHIVE_PATH" ]; then
  exit 0
fi

APP_PATH=$(find "$CI_ARCHIVE_PATH/Products/Applications" -name "*.app" -maxdepth 1 -type d | head -1)
[ -z "$APP_PATH" ] && exit 0

FRAMEWORKS_DIR="$APP_PATH/Frameworks"
[ ! -d "$FRAMEWORKS_DIR" ] && exit 0

IDENTITY=$(security find-identity -v -p codesigning | grep "Apple Distribution" | head -1 | sed -E 's/.*"(.+)".*/\1/')
[ -z "$IDENTITY" ] && { echo "No Apple Distribution cert found"; exit 1; }

echo "Re-signing with: $IDENTITY"
find "$FRAMEWORKS_DIR" -name "*.framework" -type d | while read -r fw; do
  BINARY="$fw/$(basename "$fw" .framework)"
  [ -f "$BINARY" ] && codesign --force --sign "$IDENTITY" --timestamp "$BINARY"
  codesign --force --sign "$IDENTITY" --timestamp --preserve-metadata=identifier,entitlements "$fw"
  echo "Re-signed: $(basename $fw)"
done
