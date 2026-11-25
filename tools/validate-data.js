#!/usr/bin/env node
/**
 * 题库结构校验：答案、选项、解析、知识点归属、译文引用、重复题
 * 用法：node tools/validate-data.js [build-data.json]
 */
const fs = require('fs');
const path = require('path');
const file = process.argv[2] || path.join(__dirname, '..', '..', 'build-data.json');
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const QS = d.QS, TR = d.TR, NOS = d.NOS, KB = d.KB, POINTS = d.POINTS, WRITING = d.WRITING;
const errs = [], warns = [];
const pointNames = new Set(POINTS.map(p => p[0]));
const MODULES = ['时态','语态与一致','从句','非谓语','虚拟语气','情态动词','倒装与强调','词法与搭配'];

QS.forEach((q, i) => {
  if (!Array.isArray(q) || q.length < 5) return errs.push(`#${i} 结构异常`);
  const [cat, stem, opts, ans, exp] = q;
  if (!cat || !MODULES.includes(cat) && !cat.startsWith('真题·') && cat !== '短文改错') errs.push(`#${i} 分类未知：${cat}`);
  if (!stem || String(stem).trim().length < 6) errs.push(`#${i} 题干过短`);
  const seven = cat === '真题·七选五';
  const want = seven ? 7 : 4;
  if (!Array.isArray(opts) || opts.length !== want) errs.push(`#${i} 选项应为 ${want} 个，实际 ${opts && opts.length}`);
  else {
    if (new Set(opts.map(o => String(o).trim().toLowerCase())).size !== want) errs.push(`#${i} 选项重复：${opts.join('/')}`);
    if (opts.some(o => !o || !String(o).trim())) errs.push(`#${i} 有空选项`);
  }
  if (typeof ans !== 'number' || ans < 0 || ans >= want) errs.push(`#${i} 答案索引非法：${ans}`);
  if (!exp || String(exp).trim().length < 10) warns.push(`#${i} 解析偏短`);
  const point = q[7];
  if (point && !pointNames.has(point)) errs.push(`#${i} 知识点不存在：${point}`);
  const src = q[5];
  if (src && /^20\d\d/.test(src) && !NOS[i]) warns.push(`#${i} 真题缺题号`);
});
// 译文字段
Object.keys(TR).forEach(k => {
  const t = TR[k];
  if (!t || !t.q) errs.push(`译文 #${k} 缺题干`);
  if (t && t.o && t.o.length && t.o.length !== 4) warns.push(`译文 #${k} 选项数 ${t.o.length}`);
});
// 知识点
POINTS.forEach(p => {
  if (!p || p.length < 8) errs.push(`知识点结构异常：${p && p[0]}`);
  else {
    if (!MODULES.includes(p[7])) errs.push(`知识点 ${p[0]} 模块未知：${p[7]}`);
    if (!KB[p[0]]) errs.push(`知识点 ${p[0]} 缺知识卡`);
  }
});
// 重复题干
const seen = new Map();
QS.forEach((q, i) => {
  const stem = String(q[1]).replace(/\s+/g, ' ').trim().toLowerCase();
  const isReal = /^20\d\d/.test(q[5] || '');
  // 真题同一句题干在不同卷里出现是正常的，用 来源+题干+选项 去重
  const key = isReal ? `${q[5]}|${stem}|${(q[2] || []).join('~')}` : stem;
  if (seen.has(key)) warns.push(`重复题 #${seen.get(key)} ↔ #${i}（运行时隐藏后者）`);
  else seen.set(key, i);
});
// 范文
WRITING.forEach((w, i) => { if (!w.t || !w.en || !w.zh) warns.push(`范文 #${i} 字段不全`); });

const realCount = QS.filter(q => /^20\d\d/.test(q[5] || '')).length;
console.log(`题数 ${QS.length}（真题 ${realCount}）｜译文 ${Object.keys(TR).length}｜知识点 ${POINTS.length}｜范文 ${WRITING.length}`);
console.log(`错误 ${errs.length} 项`);
errs.slice(0, 20).forEach(e => console.log('  ✗ ' + e));
console.log(`警告 ${warns.length} 项`);
warns.slice(0, 10).forEach(w => console.log('  ! ' + w));
process.exit(errs.length ? 1 : 0);
