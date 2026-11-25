#!/usr/bin/env node
/**
 * 从构建产物 web/index.html 里取出题库数据，供校验使用
 * 用法：node tools/extract-data.js [输出路径]
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '..', 'web', 'index.html');
const out = process.argv[2] || '/tmp/yuhuan-data-extracted.json';
const html = fs.readFileSync(htmlPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const noop = () => {};
const el = () => ({ innerHTML: '', textContent: '', style: {}, value: '', className: '', select: noop, focus: noop, click: noop, remove: noop });
const ctx = {
  console, setTimeout: noop, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
  document: { getElementById: el, addEventListener: noop, createElement: el, body: { appendChild: noop, className: '', setAttribute: noop }, caretRangeFromPoint: () => null },
  localStorage: { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; } },
  history: { pushState: noop, replaceState: noop, back: noop, length: 1 },
  navigator: { serviceWorker: null },
  location: { protocol: 'file:', reload: noop },
  addEventListener: noop,
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(script, ctx);
const data = { QS: ctx.QS, TR: ctx.TR, NOS: ctx.NOS, KB: ctx.KB, POINTS: ctx.POINTS, WRITING: ctx.WRITING };
fs.writeFileSync(out, JSON.stringify(data));
console.log(`导出 ${data.QS.length} 题 → ${out}`);
