#!/usr/bin/env node
/**
 * Android emulator reaches the host Metro bundler via adb reverse.
 * Run automatically before `expo start` (see package.json scripts).
 */
const { execSync } = require('child_process');

function tryAdbReverse() {
  try {
    execSync('adb reverse tcp:8081 tcp:8081', { stdio: 'ignore' });
    console.log('[dev] adb reverse tcp:8081 tcp:8081');
  } catch {
    // adb missing or no device — skip (physical device / iOS / web)
  }
}

tryAdbReverse();
