import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const html=fs.readFileSync('docs/index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate HTML IDs');
for(const m of html.matchAll(/\bhref="#([^"]+)"/g))assert.ok(ids.includes(m[1]),`Missing anchor ${m[1]}`);
for(const m of html.matchAll(/\b(?:src|href)="([^"#][^"]*)"/g)){
  if(/^https?:/.test(m[1]))continue;
  assert.ok(fs.existsSync(path.join('docs',m[1].split('?')[0])),`Missing asset ${m[1]}`);
}
assert.ok(!html.includes('href="#"'));
const css=fs.readFileSync('docs/styles.css','utf8');
assert.ok(css.includes('prefers-reduced-motion'));
assert.ok(css.includes('safe-area-inset-bottom'));
const report={checked_at:new Date().toISOString(),links_and_assets:'pass',javascript_syntax:'checked separately',browser_visual_review:'not run: required control-browser is unavailable',application_link:'not configured: contact details and product terms remain blank',source_commit:'GitHub Pages, main:/docs'};
fs.writeFileSync('verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
