#!/usr/bin/env node
/**
 * 语欢构建脚本：src/app-template.html + 数据 → web/index.html（并同步桌面端副本）
 *
 * 用法：
 *   node tools/build-app.js                    # 用当前 web/index.html 里的数据重建（改代码后常用）
 *   node tools/build-app.js --check            # 校验产物是否与模板一致（CI 用，不一致退出码 1）
 *   node tools/build-app.js --data build-data.json --dict build-dict.json
 *                                              # 题库/词典更新：用外部数据文件重新注入
 *
 * 说明：仓库只提交产物（web/index.html，GitHub Pages 直接可用）和可读模板；
 * 改界面/逻辑请改 src/app-template.html，再跑本脚本，不要直接编辑 6 MB 的 web/index.html。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'src', 'app-template.html');
const WEB_OUT = path.join(ROOT, 'web', 'index.html');
const DESKTOP_OUT = path.join(ROOT, 'desktop', 'app', 'index.html');

function fail(msg) { console.error('✗ ' + msg); process.exit(1); }

/* 从已提交的 web/index.html 里还原全部数据（自举构建） */
function extractFromHtml(html) {
  const m = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (!m) fail('web/index.html 里找不到 <script>');
  const noop = () => {};
  const makeEl = () => ({
    innerHTML: '', textContent: '', style: {}, value: '', className: '',
    select: noop, focus: noop, click: noop, remove: noop, addEventListener: noop,
    setAttribute: noop, appendChild: noop, getAttribute: () => null,
    querySelector: () => null, querySelectorAll: () => []
  });
  const els = {};
  const document = {
    getElementById(id) { return els[id] || (els[id] = makeEl()); },
    addEventListener: noop,
    createElement: makeEl,
    body: { appendChild: noop, className: '', setAttribute: noop },
    caretRangeFromPoint: () => null,
    caretPositionFromPoint: () => null,
    execCommand: () => true,
    activeElement: null
  };
  const localStorage = {
    _d: {}, getItem(k) { return this._d[k] || null; },
    setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }
  };
  const XHR = function () { this.open = noop; this.send = noop; this.setRequestHeader = noop; };
  const sandbox = {
    console: { log: noop, warn: noop, error: noop, info: noop },
    document, localStorage,
    navigator: {}, location: { protocol: 'file:', href: 'file:///index.html' },
    history: { replaceState: noop, pushState: noop },
    setTimeout: () => 1, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
    addEventListener: noop, removeEventListener: noop,
    requestAnimationFrame: noop, XMLHttpRequest: XHR,
    URL: { createObjectURL: () => '', revokeObjectURL: noop },
    Blob: function () {}, FileReader: function () {}, Promise
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  try { vm.runInContext(m[1], ctx, { timeout: 30000 }); }
  catch (e) { fail('解析 web/index.html 数据失败：' + e.message); }
  const need = ['QS', 'TR', 'NOS', 'POINTS', 'KB', 'REL', 'CLOZE', 'WRITING', 'DICT_RAW', 'EX_RAW'];
  for (const k of need) if (typeof ctx[k] === 'undefined') fail('web/index.html 缺少数据变量 ' + k);
  return {
    QS: ctx.QS, TR: ctx.TR, NOS: ctx.NOS, POINTS: ctx.POINTS, KB: ctx.KB,
    REL: ctx.REL, CLOZE: ctx.CLOZE, WRITING: ctx.WRITING,
    DICT_RAW: ctx.DICT_RAW, EX_RAW: ctx.EX_RAW, VERSION: ctx.VERSION
  };
}

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { fail('读取 JSON 失败：' + p + ' — ' + e.message); }
}

function build() {
  const args = process.argv.slice(2);
  const checkMode = args.indexOf('--check') >= 0;
  const dataIdx = args.indexOf('--data');
  const dictIdx = args.indexOf('--dict');

  if (!fs.existsSync(TEMPLATE)) fail('缺少模板 src/app-template.html');
  let tpl = fs.readFileSync(TEMPLATE, 'utf8');
  if (!fs.existsSync(WEB_OUT)) fail('缺少 web/index.html（首次构建请提供 --data/--dict）');

  const current = fs.readFileSync(WEB_OUT, 'utf8');
  const curData = extractFromHtml(current);

  let data, dictRaw, exRaw, rel;
  if (dataIdx >= 0 && args[dataIdx + 1]) {
    const d = readJson(args[dataIdx + 1]);
    data = { QS: d.QS, TR: d.TR, NOS: d.NOS, POINTS: d.POINTS, KB: d.KB, CLOZE: d.CLOZE, WRITING: d.WRITING };
    rel = d.REL || (dictIdx < 0 ? curData.REL : null);
    dictRaw = JSON.stringify(dictIdx >= 0 && args[dictIdx + 1] ? readJson(args[dictIdx + 1]) : JSON.parse(curData.DICT_RAW));
    exRaw = curData.EX_RAW;
  } else {
    data = curData; dictRaw = curData.DICT_RAW; exRaw = curData.EX_RAW; rel = curData.REL;
  }
  const tr = {}, nos = {};
  for (const k in data.TR) tr[String(k)] = data.TR[k];
  for (const k in data.NOS) nos[String(k)] = data.NOS[k];

  const map = {
    '__QS__': data.QS, '__TR__': tr, '__NOS__': nos, '__POINTS__': data.POINTS,
    '__KB__': data.KB, '__CLOZE__': data.CLOZE, '__WRITING__': data.WRITING,
    '__REL__': rel, '__DICT__': dictRaw, '__EX__': exRaw
  };
  for (const k of Object.keys(map)) {
    if (tpl.indexOf(k) < 0) fail('模板缺占位符 ' + k);
    tpl = tpl.replace(k, JSON.stringify(map[k]));
  }
  if (/__[A-Z]+__/.test(tpl)) fail('仍有未替换占位符：' + tpl.match(/__[A-Z]+__/g));
  const ver = (tpl.match(/var VERSION = "([0-9.]+)"/) || [])[1] || '?';

  if (checkMode) {
    if (current === tpl) { console.log('✓ 构建一致（v' + ver + '），模板与产物同步'); return; }
    // 找出第一个差异位置，给出可读提示
    let i = 0; while (i < current.length && i < tpl.length && current[i] === tpl[i]) i++;
    console.error('✗ 产物与模板不一致（v' + ver + '）：第一个差异在偏移 ' + i);
    console.error('  请运行 node tools/build-app.js 重新生成 web/index.html，不要直接改产物。');
    process.exit(1);
  }

  fs.writeFileSync(WEB_OUT, tpl);
  try {
    fs.mkdirSync(path.dirname(DESKTOP_OUT), { recursive: true });
    fs.writeFileSync(DESKTOP_OUT, tpl);
  } catch (e) { console.warn('! 桌面端副本同步失败：' + e.message); }
  console.log('✓ 构建完成：v' + ver + '，' + (Buffer.byteLength(tpl) / 1048576).toFixed(2) + ' MB → web/index.html');
}

build();
