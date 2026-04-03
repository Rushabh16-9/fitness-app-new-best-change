const fs = require('fs');
const path = require('path');

const root = process.cwd();
const targetDir = path.join(root, 'node_modules', 'amazing-time-picker', 'node_modules', 'rxjs', 'add');

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (entry.isFile() && fullPath.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

try {
  if (!fs.existsSync(targetDir)) {
    console.log('[fix-amazing-time-picker-rxjs-dts] target folder not found, skipping');
    process.exit(0);
  }

  const dtsFiles = walk(targetDir);
  let patched = 0;

  for (const file of dtsFiles) {
    const replacement = 'export {};\n';
    const current = fs.readFileSync(file, 'utf8');
    if (current !== replacement) {
      fs.writeFileSync(file, replacement, 'utf8');
      patched++;
    }
  }

  console.log(`[fix-amazing-time-picker-rxjs-dts] patched ${patched} declaration file(s)`);
} catch (err) {
  console.error('[fix-amazing-time-picker-rxjs-dts] failed:', err);
  process.exit(1);
}
