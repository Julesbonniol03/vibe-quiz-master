#!/bin/sh
set -e

# Install Node.js (not available by default in Xcode Cloud)
brew install node

cd "$CI_PRIMARY_REPOSITORY_PATH"
npm install
npx cap sync ios
