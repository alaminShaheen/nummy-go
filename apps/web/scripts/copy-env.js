#!/usr/bin/env node
/**
 * Cross-platform script to copy environment files
 * Usage: node scripts/copy-env.js <source> <destination>
 */

const fs = require('fs');
const path = require('path');

const [source, dest] = process.argv.slice(2);

if (!source || !dest) {
  console.error('Usage: node copy-env.js <source> <destination>');
  process.exit(1);
}

const sourcePath = path.resolve(process.cwd(), source);
const destPath = path.resolve(process.cwd(), dest);

try {
  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: Source file "${source}" does not exist`);
    process.exit(1);
  }

  fs.copyFileSync(sourcePath, destPath);
  console.log(`✓ Copied ${source} → ${dest}`);
} catch (error) {
  console.error(`Error copying file: ${error.message}`);
  process.exit(1);
}
