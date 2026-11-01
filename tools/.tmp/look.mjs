import { chromium } from 'playwright';
const url = process.argv[2] || 'http://localhost:8080/eighteen-pleats/';
const save = process.argv[3] ? JSON.parse(process.argv[3]) : null;
const out = process.argv[4] || '/tmp/ep/shot.png';
const taps = Number(process.argv[5] || 0);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
if (save) await p.addInitScript(s => { localStorage.setItem('di:11:save', JSON.stringify(s)); }, save);
await p.goto(url); await p.waitForTimeout(1500);
for (let i = 0; i < taps; i++) { await p.click('#stage'); await p.waitForTimeout(1300); if (i % 3 === 0) { const s = await p.$('.slip'); if (s) await s.click(); } }
await p.waitForTimeout(500);
await p.screenshot({ path: out });
console.log(errs.join('\n') || 'no errors');
await b.close();
