#!/bin/sh
set -e

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

brew install node
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm install
npx cap sync ios
