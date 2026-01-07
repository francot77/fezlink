/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

function deepKeys(obj: any, prefix: string[] = []) {
  const keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const next = [...prefix, k];
    if (v && typeof v === 'object') {
      keys.push(...deepKeys(v, next));
    } else {
      keys.push(next.join('.'));
    }
  }
  return keys;
}

function getLocalesDir() {
  return path.resolve(process.cwd(), 'src', 'locales');
}

function readJson(p: string) {
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function deepGet(obj: any, pathStr: string) {
  const parts = pathStr.split('.');
  let node = obj;
  for (const p of parts) {
    if (!node || typeof node !== 'object') return undefined;
    node = node[p];
  }
  return node;
}

const basePath = path.join(getLocalesDir(), '_base.json');
const base = readJson(basePath);
const required: Record<string, string[]> = {};
for (const ns of Object.keys(base)) {
  required[ns] = deepKeys(base[ns], []);
}

const locales = fs.readdirSync(getLocalesDir()).filter((d) => !d.startsWith('_'));
const report: Record<string, Record<string, string[]>> = {};
for (const locale of locales) {
  const dir = path.join(getLocalesDir(), locale);
  const combined = {};
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    const data = readJson(path.join(dir, f));
    Object.assign(combined, data);
  }
  report[locale] = {};
  for (const ns of Object.keys(required)) {
    const missing: string[] = [];
    for (const key of required[ns]) {
      const full = `${ns}.${key}`;
      if (deepGet(combined, full) === undefined) {
        missing.push(key);
      }
    }
    report[locale][ns] = missing;
  }
}

const outPath = path.join(getLocalesDir(), '_report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log('i18n validation report written to', outPath);
