import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve('docs');
function walk(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const name = path.join(folder, entry.name);
    return entry.isDirectory() ? walk(name) : [name];
  });
}
const files = walk(root);
const pages = new Map(files.filter(file => file.endsWith('.html')).map(file => {
  const html = fs.readFileSync(file, 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `Duplicate IDs: ${file}`);
  assert.ok(!html.includes('href="#"'), `Placeholder link: ${file}`);
  return [file, { html, ids }];
}));
let localReferences = 0;
function checkReference(source, reference) {
  const url = new URL(reference, pathToFileURL(source));
  if (url.protocol !== 'file:') return;
  let target = fileURLToPath(url);
  assert.ok(target.startsWith(root + path.sep), `Reference outside site: ${reference} in ${source}`);
  assert.ok(fs.existsSync(target), `Missing file: ${reference} in ${source}`);
  if (fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  assert.ok(fs.existsSync(target), `Missing page: ${reference} in ${source}`);
  if (url.hash) {
    const id = decodeURIComponent(url.hash.slice(1));
    assert.ok(pages.get(target)?.ids.includes(id), `Missing anchor: ${reference} in ${source}`);
  }
  localReferences++;
}
for (const [file, { html }] of pages) {
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) checkReference(file, match[1]);
}
for (const file of files.filter(file => file.endsWith('.css'))) {
  const css = fs.readFileSync(file, 'utf8');
  for (const match of css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) checkReference(file, match[1]);
}
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
assert.ok(css.includes('prefers-reduced-motion'));
assert.ok(css.includes('safe-area-inset-bottom'));
const report = {
  checked_at: new Date().toISOString(),
  pages_checked: pages.size,
  local_references_checked: localReferences,
  links_and_assets: 'pass',
  javascript: 'none required: navigation and FAQ use native HTML',
  browser_visual_review: 'not run: required control-browser is unavailable',
  application_link: 'not configured: contact details and product terms remain blank',
  source_commit: 'GitHub Pages, main:/docs',
};
fs.writeFileSync('verification.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
