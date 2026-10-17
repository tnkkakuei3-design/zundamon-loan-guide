import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {calculateLoan} from './docs/loan-math.js';

const base=calculateLoan(100000,18,12);
assert.equal(base.payment,9168);
assert.equal(base.total,110009);
assert.equal(base.interest,10009);
assert.equal(base.schedule.at(-1).payment,9161);
const zero=calculateLoan(100000,0,12);
assert.equal(zero.interest,0);
assert.equal(zero.total,100000);
assert.equal(zero.schedule.at(-1).balance,0);
assert.equal(calculateLoan(120000,0,12).payment,10000);
assert.equal(calculateLoan(100000,12,1).total,101000);
const short=calculateLoan(100000,18,6);
const long=calculateLoan(100000,18,24);
assert.ok(short.payment>base.payment && base.payment>long.payment);
assert.ok(short.interest<base.interest && base.interest<long.interest);
for(const args of [[1000,0,3],[1000,20,36],[100000,18,12],[500000,15,36],[5000000,20,36]]){
  const r=calculateLoan(...args);
  assert.equal(r.schedule.at(-1).balance,0);
  assert.equal(r.total,r.principal+r.interest);
  assert.equal(r.total,r.schedule.reduce((n,x)=>n+x.payment,0));
  assert.equal(r.interest,r.schedule.reduce((n,x)=>n+x.interest,0));
  assert.ok(r.schedule.every(x=>x.balance>=0&&x.payment>=x.interest));
}
for(const args of [[0,18,12],[100000,-1,12],[100000,Infinity,12],[100000,21,12],[100000,18,0],[100000,18,NaN],[5000001,18,12]])assert.throws(()=>calculateLoan(...args));

const html=fs.readFileSync('docs/index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate HTML IDs');
for(const m of html.matchAll(/\bhref="#([^"]+)"/g))assert.ok(ids.includes(m[1]),`Missing anchor ${m[1]}`);
for(const m of html.matchAll(/\b(?:src|href)="([^"#][^"]*)"/g)){
  if(/^https?:/.test(m[1]))continue;
  assert.ok(fs.existsSync(path.join('docs',m[1].split('?')[0])),`Missing asset ${m[1]}`);
}
assert.ok(html.includes('初期値の年18.0％は計算例'));
assert.ok(!html.includes('href="#"'));
const css=fs.readFileSync('docs/styles.css','utf8');
assert.ok(css.includes('prefers-reduced-motion'));
assert.ok(css.includes('safe-area-inset-bottom'));
const report={checked_at:new Date().toISOString(),calculation:'pass: fixed example, zero rate, single payment, repayment tradeoff, totals, bounds',links_and_assets:'pass',javascript_syntax:'checked separately',browser_visual_review:'pending public deployment review',application_link:'pending actual lender and URL',source_commit:'GitHub Pages, main:/docs'};
fs.writeFileSync('verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
