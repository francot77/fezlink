/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

function walk(dir: string, files: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full.includes(path.sep + 'locales')) continue;
      files = walk(full, files);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function extractFromFile(content: string) {
  const results: Record<string, Set<string>> = {};
  const useTx = [
    ...content.matchAll(/const\s+(\w+)\s*=\s*useTranslations\(\s*['"]([\w.-]+)['"]\s*\)/g),
  ];
  for (const m of useTx) {
    const v = m[1];
    const ns = m[2];
    const calls = [...content.matchAll(new RegExp(`${v}\\(\\s*['"]([\\w.-]+)['"]`, 'g'))];
    if (!results[ns]) results[ns] = new Set();
    for (const c of calls) results[ns].add(c[1]);
  }
  const getTx = [
    ...content.matchAll(/const\s+(\w+)\s*=\s*await\s*getTranslations\(\s*['"]([\w.-]+)['"]\s*\)/g),
  ];
  for (const m of getTx) {
    const v = m[1];
    const ns = m[2];
    const calls = [...content.matchAll(new RegExp(`${v}\\(\\s*['"]([\\w.-]+)['"]`, 'g'))];
    if (!results[ns]) results[ns] = new Set();
    for (const c of calls) results[ns].add(c[1]);
  }
  return results;
}

function mergeSets(a: Record<string, Set<string>>, b: Record<string, Set<string>>) {
  for (const ns of Object.keys(b)) {
    if (!a[ns]) a[ns] = new Set();
    for (const k of b[ns]) a[ns].add(k);
  }
}

function toTree(keys: string[]) {
  const root: any = {};
  for (const k of keys) {
    const parts = k.split('.');
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) {
        node[p] = '';
      } else {
        node[p] = node[p] || {};
        node = node[p];
      }
    }
  }
  return root;
}

const srcDir = path.resolve(process.cwd(), 'src');
const files = walk(srcDir, []);
const aggregated: Record<string, Set<string>> = {};
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const extracted = extractFromFile(content);
  mergeSets(aggregated, extracted);
}
const base: any = {};
for (const ns of Object.keys(aggregated)) {
  base[ns] = toTree(Array.from(aggregated[ns]));
}
const outPath = path.resolve(process.cwd(), 'src', 'locales', '_base.json');
fs.writeFileSync(outPath, JSON.stringify(base, null, 2));
console.log('i18n base extracted to', outPath);
